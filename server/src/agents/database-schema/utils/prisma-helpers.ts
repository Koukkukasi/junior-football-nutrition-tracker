import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export class PrismaHelpers {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async transactionWrapper<T>(
    callback: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return await callback(tx as PrismaClient);
      });
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async batchInsert<T>(
    model: string,
    data: T[],
    batchSize: number = 100
  ): Promise<void> {
    const batches = this.createBatches(data, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Processing batch ${i + 1}/${batches.length} for ${model}`);
      
      try {
        await (this.prisma as any)[model].createMany({
          data: batch,
          skipDuplicates: true
        });
      } catch (error) {
        logger.error(`Batch ${i + 1} failed:`, error);
        throw error;
      }
    }
  }

  async batchUpdate<T>(
    model: string,
    updates: Array<{ where: any; data: T }>,
    batchSize: number = 50
  ): Promise<void> {
    const batches = this.createBatches(updates, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Processing update batch ${i + 1}/${batches.length} for ${model}`);
      
      await this.prisma.$transaction(
        batch.map(update => 
          (this.prisma as any)[model].update({
            where: update.where,
            data: update.data
          })
        )
      );
    }
  }

  async batchDelete(
    model: string,
    ids: string[],
    batchSize: number = 100
  ): Promise<void> {
    const batches = this.createBatches(ids, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`Deleting batch ${i + 1}/${batches.length} from ${model}`);
      
      await (this.prisma as any)[model].deleteMany({
        where: {
          id: {
            in: batch
          }
        }
      });
    }
  }

  async softDelete(
    model: string,
    id: string
  ): Promise<void> {
    await (this.prisma as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async restore(
    model: string,
    id: string
  ): Promise<void> {
    await (this.prisma as any)[model].update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async findWithPagination<T>(
    model: string,
    page: number = 1,
    pageSize: number = 20,
    where?: any,
    orderBy?: any
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;
    
    const [data, total] = await Promise.all([
      (this.prisma as any)[model].findMany({
        where,
        orderBy,
        skip,
        take: pageSize
      }),
      (this.prisma as any)[model].count({ where })
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async upsertMany<T>(
    model: string,
    data: T[],
    uniqueFields: string[]
  ): Promise<void> {
    for (const item of data) {
      const where: any = {};
      for (const field of uniqueFields) {
        where[field] = (item as any)[field];
      }

      await (this.prisma as any)[model].upsert({
        where,
        update: item,
        create: item
      });
    }
  }

  async getModelStats(model: string): Promise<{
    count: number;
    firstCreated?: Date;
    lastCreated?: Date;
    lastUpdated?: Date;
  }> {
    const count = await (this.prisma as any)[model].count();
    
    const first = await (this.prisma as any)[model].findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });

    const lastCreated = await (this.prisma as any)[model].findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const lastUpdated = await (this.prisma as any)[model].findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    return {
      count,
      firstCreated: first?.createdAt,
      lastCreated: lastCreated?.createdAt,
      lastUpdated: lastUpdated?.updatedAt
    };
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database connection check failed:', error);
      return false;
    }
  }

  async getDatabaseSize(): Promise<{
    database: string;
    size: string;
    tables: Array<{ name: string; size: string; rows: number }>;
  }> {
    const dbName = await this.prisma.$queryRaw<any[]>`
      SELECT current_database() as name
    `;

    const dbSize = await this.prisma.$queryRaw<any[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;

    const tables = await this.prisma.$queryRaw<any[]>`
      SELECT 
        schemaname || '.' || tablename as name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_live_tup as rows
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;

    return {
      database: dbName[0].name,
      size: dbSize[0].size,
      tables: tables.map(t => ({
        name: t.name,
        size: t.size,
        rows: parseInt(t.rows)
      }))
    };
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async executeRawQuery<T = any>(query: string, params?: any[]): Promise<T> {
    const startTime = Date.now();
    logger.logQuery(query, params);
    
    try {
      const result = params 
        ? await this.prisma.$queryRawUnsafe<T>(query, ...params)
        : await this.prisma.$queryRawUnsafe<T>(query);
      
      logger.logPerformance('Raw query', startTime);
      return result;
    } catch (error) {
      logger.error('Raw query failed:', error);
      throw error;
    }
  }

  async truncateTable(tableName: string, cascade: boolean = false): Promise<void> {
    const cascadeClause = cascade ? ' CASCADE' : '';
    await this.prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${tableName}"${cascadeClause}`
    );
    logger.info(`Table ${tableName} truncated${cascade ? ' with CASCADE' : ''}`);
  }

  async vacuum(tableName?: string): Promise<void> {
    const table = tableName ? `"${tableName}"` : '';
    await this.prisma.$executeRawUnsafe(`VACUUM ANALYZE ${table}`);
    logger.info(`VACUUM ANALYZE completed${tableName ? ` for ${tableName}` : ''}`);
  }

  async reindex(tableName?: string): Promise<void> {
    const table = tableName ? `TABLE "${tableName}"` : 'DATABASE';
    await this.prisma.$executeRawUnsafe(`REINDEX ${table}`);
    logger.info(`REINDEX completed for ${table}`);
  }
}

export const createPrismaHelpers = (prisma: PrismaClient) => {
  return new PrismaHelpers(prisma);
};

export default PrismaHelpers;