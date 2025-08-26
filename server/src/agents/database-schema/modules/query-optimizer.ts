import { PrismaClient } from '@prisma/client';
import { AgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsAffected: number;
  indexesUsed: string[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  slowQueries: QueryAnalysis[];
  missingIndexes: string[];
  unusedIndexes: string[];
  tableStats: TableStats[];
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  sizeInMB: number;
  indexCount: number;
  lastVacuum?: Date;
  lastAnalyze?: Date;
}

export class QueryOptimizer {
  private prisma: PrismaClient;
  private config: AgentConfig;
  private queryLog: Map<string, QueryAnalysis[]> = new Map();

  constructor(prisma: PrismaClient, config: AgentConfig) {
    this.prisma = prisma;
    this.config = config;
  }

  async analyzeAndOptimize(): Promise<{ recommendations: string[] }> {
    const recommendations: string[] = [];
    
    try {
      // Analyze slow queries
      const slowQueries = await this.identifySlowQueries();
      for (const query of slowQueries) {
        recommendations.push(...query.recommendations);
      }

      // Check for missing indexes
      const missingIndexes = await this.identifyMissingIndexes();
      for (const index of missingIndexes) {
        recommendations.push(`Create index: ${index}`);
      }

      // Check for unused indexes
      const unusedIndexes = await this.identifyUnusedIndexes();
      for (const index of unusedIndexes) {
        recommendations.push(`Consider removing unused index: ${index}`);
      }

      // Analyze table statistics
      const tableStats = await this.analyzeTableStatistics();
      for (const stat of tableStats) {
        if (stat.rowCount > 100000 && !stat.lastVacuum) {
          recommendations.push(`Run VACUUM ANALYZE on ${stat.tableName}`);
        }
      }

      // Check for N+1 queries
      const n1Queries = await this.detectN1Queries();
      if (n1Queries.length > 0) {
        recommendations.push(`Detected ${n1Queries.length} potential N+1 query patterns`);
      }

      logger.info(`✅ Query optimization complete: ${recommendations.length} recommendations`);
    } catch (error) {
      logger.error('Query optimization failed:', error);
    }

    return { recommendations };
  }

  async performanceAnalysis(): Promise<PerformanceMetrics> {
    const slowQueries = await this.identifySlowQueries();
    const missingIndexes = await this.identifyMissingIndexes();
    const unusedIndexes = await this.identifyUnusedIndexes();
    const tableStats = await this.analyzeTableStatistics();

    return {
      slowQueries,
      missingIndexes,
      unusedIndexes,
      tableStats
    };
  }

  private async identifySlowQueries(): Promise<QueryAnalysis[]> {
    const slowQueries: QueryAnalysis[] = [];
    
    try {
      const queries = await this.prisma.$queryRaw<any[]>`
        SELECT 
          query,
          mean_exec_time as execution_time,
          calls,
          total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > ${this.config.optimization.slowQueryThreshold}
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `;

      for (const q of queries) {
        const analysis = await this.analyzeQuery(q.query);
        slowQueries.push({
          query: q.query,
          executionTime: parseFloat(q.execution_time),
          rowsAffected: 0,
          indexesUsed: analysis.indexes,
          recommendations: analysis.recommendations
        });
      }
    } catch (error) {
      // pg_stat_statements might not be enabled
      logger.warn('Could not analyze slow queries - pg_stat_statements may not be enabled');
    }

    return slowQueries;
  }

  private async identifyMissingIndexes(): Promise<string[]> {
    const missingIndexes: string[] = [];
    
    try {
      // Check foreign keys without indexes
      const fkWithoutIndex = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT
          tc.table_name,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN pg_indexes pi
          ON pi.tablename = tc.table_name
          AND pi.indexdef LIKE '%' || kcu.column_name || '%'
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND pi.indexname IS NULL
      `;

      for (const fk of fkWithoutIndex) {
        missingIndexes.push(
          `CREATE INDEX idx_${fk.table_name}_${fk.column_name} ON "${fk.table_name}" ("${fk.column_name}");`
        );
      }

      // Check commonly filtered columns without indexes
      const commonFilters = [
        { table: 'FoodEntry', column: 'date' },
        { table: 'FoodEntry', column: 'mealType' },
        { table: 'PerformanceMetric', column: 'date' },
        { table: 'User', column: 'role' },
        { table: 'User', column: 'teamId' }
      ];

      for (const filter of commonFilters) {
        const indexExists = await this.checkIndexExists(filter.table, filter.column);
        if (!indexExists) {
          missingIndexes.push(
            `CREATE INDEX idx_${filter.table}_${filter.column} ON "${filter.table}" ("${filter.column}");`
          );
        }
      }
    } catch (error) {
      logger.error('Failed to identify missing indexes:', error);
    }

    return missingIndexes;
  }

  private async identifyUnusedIndexes(): Promise<string[]> {
    const unusedIndexes: string[] = [];
    
    try {
      const indexes = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'
        AND indexrelname NOT LIKE '%_unique'
      `;

      for (const idx of indexes) {
        unusedIndexes.push(`${idx.schemaname}.${idx.tablename}.${idx.indexname}`);
      }
    } catch (error) {
      logger.error('Failed to identify unused indexes:', error);
    }

    return unusedIndexes;
  }

  private async analyzeTableStatistics(): Promise<TableStats[]> {
    const stats: TableStats[] = [];
    
    try {
      const tables = await this.prisma.$queryRaw<any[]>`
        SELECT 
          schemaname,
          tablename,
          n_live_tup as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          last_vacuum,
          last_analyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `;

      for (const table of tables) {
        const indexCount = await this.prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM pg_indexes
          WHERE tablename = ${table.tablename}
        `;

        stats.push({
          tableName: table.tablename,
          rowCount: parseInt(table.row_count),
          sizeInMB: this.parseSizeToMB(table.size),
          indexCount: parseInt(indexCount[0].count),
          lastVacuum: table.last_vacuum ? new Date(table.last_vacuum) : undefined,
          lastAnalyze: table.last_analyze ? new Date(table.last_analyze) : undefined
        });
      }
    } catch (error) {
      logger.error('Failed to analyze table statistics:', error);
    }

    return stats;
  }

  private async detectN1Queries(): Promise<string[]> {
    const n1Patterns: string[] = [];
    
    // Look for patterns in query log that indicate N+1 queries
    for (const [pattern, queries] of this.queryLog) {
      if (queries.length > 10) {
        // If we see the same query pattern more than 10 times in a short period
        n1Patterns.push(pattern);
      }
    }

    return n1Patterns;
  }

  private async analyzeQuery(query: string): Promise<{ indexes: string[]; recommendations: string[] }> {
    const indexes: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Get EXPLAIN output for the query
      const explain = await this.prisma.$queryRaw<any[]>`EXPLAIN ${query}`;
      
      for (const row of explain) {
        const plan = row['QUERY PLAN'];
        
        // Check if sequential scan is being used
        if (plan.includes('Seq Scan')) {
          recommendations.push('Query uses sequential scan - consider adding index');
        }
        
        // Extract index usage
        const indexMatch = plan.match(/Index Scan.*on (\w+)/);
        if (indexMatch) {
          indexes.push(indexMatch[1]);
        }
        
        // Check for nested loops with high cost
        if (plan.includes('Nested Loop') && plan.includes('cost=')) {
          const costMatch = plan.match(/cost=(\d+\.\d+)/);
          if (costMatch && parseFloat(costMatch[1]) > 1000) {
            recommendations.push('High cost nested loop detected - optimize join conditions');
          }
        }
      }
    } catch (error) {
      // EXPLAIN might fail for some queries
      logger.debug('Could not analyze query:', error);
    }

    return { indexes, recommendations };
  }

  private async checkIndexExists(table: string, column: string): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE tablename = ${table}
        AND indexdef LIKE '%${column}%'
      `;
      
      return parseInt(result[0].count) > 0;
    } catch (error) {
      return false;
    }
  }

  private parseSizeToMB(sizeStr: string): number {
    const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
    if (!match) return 0;
    
    const [, value, unit] = match;
    const num = parseFloat(value);
    
    switch (unit.toLowerCase()) {
      case 'kb': return num / 1024;
      case 'mb': return num;
      case 'gb': return num * 1024;
      case 'tb': return num * 1024 * 1024;
      default: return num;
    }
  }

  async optimizeSpecificQuery(query: string): Promise<{
    original: string;
    optimized: string;
    improvements: string[];
  }> {
    const improvements: string[] = [];
    let optimized = query;
    
    // Basic query optimization rules
    if (query.toLowerCase().includes('select *')) {
      improvements.push('Avoid SELECT * - specify needed columns');
      optimized = optimized.replace(/SELECT \*/gi, 'SELECT /* specify columns */');
    }
    
    if (!query.toLowerCase().includes('limit') && query.toLowerCase().includes('select')) {
      improvements.push('Consider adding LIMIT clause for large result sets');
    }
    
    if (query.toLowerCase().includes('like \'%')) {
      improvements.push('Leading wildcard in LIKE prevents index usage');
    }
    
    if (query.toLowerCase().includes('or')) {
      improvements.push('OR conditions may prevent index usage - consider UNION');
    }
    
    return {
      original: query,
      optimized,
      improvements
    };
  }

  logQuery(query: string, executionTime: number): void {
    if (!this.config.optimization.queryLogEnabled) return;
    
    const pattern = this.extractQueryPattern(query);
    
    if (!this.queryLog.has(pattern)) {
      this.queryLog.set(pattern, []);
    }
    
    this.queryLog.get(pattern)!.push({
      query,
      executionTime,
      rowsAffected: 0,
      indexesUsed: [],
      recommendations: []
    });
    
    // Keep only last 100 queries per pattern
    const queries = this.queryLog.get(pattern)!;
    if (queries.length > 100) {
      queries.shift();
    }
  }

  private extractQueryPattern(query: string): string {
    // Remove specific values to identify query patterns
    return query
      .replace(/'\d+'/g, "'?'")
      .replace(/=\s*\d+/g, '= ?')
      .replace(/IN\s*\([^)]+\)/gi, 'IN (?)')
      .trim();
  }
}

export default QueryOptimizer;