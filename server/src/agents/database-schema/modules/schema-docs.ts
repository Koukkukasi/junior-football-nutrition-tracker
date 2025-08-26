import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';

export interface SchemaDocumentation {
  models: ModelDocumentation[];
  enums: EnumDocumentation[];
  relationships: RelationshipDocumentation[];
  generatedAt: Date;
  version: string;
}

export interface ModelDocumentation {
  name: string;
  description: string;
  fields: FieldDocumentation[];
  indexes: string[];
  constraints: string[];
}

export interface FieldDocumentation {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: string;
  description: string;
}

export interface EnumDocumentation {
  name: string;
  values: string[];
  description: string;
}

export interface RelationshipDocumentation {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  field: string;
  description: string;
}

export class SchemaDocumentationGenerator {
  private config: AgentConfig;
  private schemaPath: string;

  constructor(config: AgentConfig) {
    this.config = config;
    this.schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  }

  async generateFullDocumentation(outputPath?: string): Promise<void> {
    try {
      logger.info('📚 Generating schema documentation...');
      
      const documentation = await this.analyzeSchema();
      const outputDir = outputPath || this.config.documentation.outputPath;
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate different formats
      if (this.config.documentation.formats.includes('markdown')) {
        await this.generateMarkdownDocs(documentation, outputDir);
      }
      
      if (this.config.documentation.formats.includes('html')) {
        await this.generateHtmlDocs(documentation, outputDir);
      }
      
      if (this.config.documentation.formats.includes('json')) {
        await this.generateJsonDocs(documentation, outputDir);
      }

      if (this.config.documentation.includeERDiagram) {
        await this.generateERDiagram(documentation, outputDir);
      }

      logger.info(`✅ Documentation generated in ${outputDir}`);
    } catch (error) {
      logger.error('Documentation generation failed:', error);
      throw error;
    }
  }

  private async analyzeSchema(): Promise<SchemaDocumentation> {
    const schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
    
    const models = this.extractModels(schemaContent);
    const enums = this.extractEnums(schemaContent);
    const relationships = this.extractRelationships(schemaContent);

    return {
      models,
      enums,
      relationships,
      generatedAt: new Date(),
      version: this.config.version
    };
  }

  private extractModels(schemaContent: string): ModelDocumentation[] {
    const models: ModelDocumentation[] = [];
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
    
    let match;
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      const fields = this.extractFields(modelBody);
      const indexes = this.extractIndexes(modelBody);
      const constraints = this.extractConstraints(modelBody);
      
      models.push({
        name: modelName,
        description: this.getModelDescription(modelName),
        fields,
        indexes,
        constraints
      });
    }

    return models;
  }

  private extractFields(modelBody: string): FieldDocumentation[] {
    const fields: FieldDocumentation[] = [];
    const fieldRegex = /(\w+)\s+(\w+(?:\[\])?)\s*([^?\n]*)?(\?)?/g;
    
    const lines = modelBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
      
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const type = parts[1];
        const isOptional = type.includes('?') || trimmed.includes('?');
        const hasDefault = trimmed.includes('@default');
        const isUnique = trimmed.includes('@unique');
        const isId = trimmed.includes('@id');
        
        fields.push({
          name,
          type: type.replace('?', ''),
          required: !isOptional && !hasDefault,
          unique: isUnique || isId,
          default: this.extractDefault(trimmed),
          description: this.getFieldDescription(name)
        });
      }
    }

    return fields;
  }

  private extractIndexes(modelBody: string): string[] {
    const indexes: string[] = [];
    const indexRegex = /@@index\(\[([^\]]+)\]\)/g;
    
    let match;
    while ((match = indexRegex.exec(modelBody)) !== null) {
      indexes.push(match[1]);
    }

    return indexes;
  }

  private extractConstraints(modelBody: string): string[] {
    const constraints: string[] = [];
    
    if (modelBody.includes('@@unique')) {
      const uniqueMatch = modelBody.match(/@@unique\(\[([^\]]+)\]\)/);
      if (uniqueMatch) {
        constraints.push(`UNIQUE(${uniqueMatch[1]})`);
      }
    }

    return constraints;
  }

  private extractEnums(schemaContent: string): EnumDocumentation[] {
    const enums: EnumDocumentation[] = [];
    const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
    
    let match;
    while ((match = enumRegex.exec(schemaContent)) !== null) {
      const enumName = match[1];
      const enumBody = match[2];
      const values = enumBody
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .map(line => line.replace(/,?\s*$/, ''));
      
      enums.push({
        name: enumName,
        values,
        description: this.getEnumDescription(enumName)
      });
    }

    return enums;
  }

  private extractRelationships(schemaContent: string): RelationshipDocumentation[] {
    const relationships: RelationshipDocumentation[] = [];
    const relationRegex = /(\w+)\s+(\w+)(?:\[\])?\s+@relation\(fields:\s*\[([^\]]+)\]/g;
    
    let match;
    while ((match = relationRegex.exec(schemaContent)) !== null) {
      const field = match[1];
      const targetModel = match[2];
      const isArray = match[0].includes('[]');
      
      relationships.push({
        from: 'Model', // Would need context to determine actual model
        to: targetModel,
        type: isArray ? 'one-to-many' : 'one-to-one',
        field,
        description: `Relationship via ${field}`
      });
    }

    return relationships;
  }

  private extractDefault(fieldLine: string): string | undefined {
    const defaultMatch = fieldLine.match(/@default\(([^)]+)\)/);
    return defaultMatch ? defaultMatch[1] : undefined;
  }

  private async generateMarkdownDocs(doc: SchemaDocumentation, outputDir: string): Promise<void> {
    let markdown = `# Database Schema Documentation\n\n`;
    markdown += `Generated: ${doc.generatedAt.toISOString()}\n`;
    markdown += `Version: ${doc.version}\n\n`;
    
    markdown += `## Models\n\n`;
    for (const model of doc.models) {
      markdown += `### ${model.name}\n\n`;
      markdown += `${model.description}\n\n`;
      markdown += `| Field | Type | Required | Unique | Default | Description |\n`;
      markdown += `|-------|------|----------|--------|---------|-------------|\n`;
      
      for (const field of model.fields) {
        markdown += `| ${field.name} | ${field.type} | ${field.required ? '✓' : ''} | ${field.unique ? '✓' : ''} | ${field.default || ''} | ${field.description} |\n`;
      }
      
      if (model.indexes.length > 0) {
        markdown += `\n**Indexes:** ${model.indexes.join(', ')}\n`;
      }
      
      if (model.constraints.length > 0) {
        markdown += `**Constraints:** ${model.constraints.join(', ')}\n`;
      }
      
      markdown += `\n`;
    }
    
    markdown += `## Enums\n\n`;
    for (const enumDoc of doc.enums) {
      markdown += `### ${enumDoc.name}\n\n`;
      markdown += `${enumDoc.description}\n\n`;
      markdown += `Values: ${enumDoc.values.join(', ')}\n\n`;
    }
    
    markdown += `## Relationships\n\n`;
    markdown += `| From | To | Type | Field | Description |\n`;
    markdown += `|------|-----|------|-------|-------------|\n`;
    for (const rel of doc.relationships) {
      markdown += `| ${rel.from} | ${rel.to} | ${rel.type} | ${rel.field} | ${rel.description} |\n`;
    }

    const outputPath = path.join(outputDir, 'schema.md');
    fs.writeFileSync(outputPath, markdown);
    logger.info(`✅ Markdown documentation saved to ${outputPath}`);
  }

  private async generateHtmlDocs(doc: SchemaDocumentation, outputDir: string): Promise<void> {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Database Schema Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 5px; }
    h3 { color: #888; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .check { color: green; }
  </style>
</head>
<body>
  <h1>Database Schema Documentation</h1>
  <p>Generated: ${doc.generatedAt.toISOString()}</p>
  <p>Version: ${doc.version}</p>
`;
    
    html += `<h2>Models</h2>`;
    for (const model of doc.models) {
      html += `<h3>${model.name}</h3>`;
      html += `<p>${model.description}</p>`;
      html += `<table>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Required</th>
          <th>Unique</th>
          <th>Default</th>
          <th>Description</th>
        </tr>`;
      
      for (const field of model.fields) {
        html += `<tr>
          <td>${field.name}</td>
          <td>${field.type}</td>
          <td>${field.required ? '<span class="check">✓</span>' : ''}</td>
          <td>${field.unique ? '<span class="check">✓</span>' : ''}</td>
          <td>${field.default || ''}</td>
          <td>${field.description}</td>
        </tr>`;
      }
      html += `</table>`;
    }
    
    html += `</body></html>`;
    
    const outputPath = path.join(outputDir, 'schema.html');
    fs.writeFileSync(outputPath, html);
    logger.info(`✅ HTML documentation saved to ${outputPath}`);
  }

  private async generateJsonDocs(doc: SchemaDocumentation, outputDir: string): Promise<void> {
    const outputPath = path.join(outputDir, 'schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2));
    logger.info(`✅ JSON documentation saved to ${outputPath}`);
  }

  private async generateERDiagram(doc: SchemaDocumentation, outputDir: string): Promise<void> {
    let mermaid = `graph TD\n`;
    
    // Add models as nodes
    for (const model of doc.models) {
      const fields = model.fields.map(f => `${f.name}: ${f.type}`).join('<br/>');
      mermaid += `  ${model.name}["<b>${model.name}</b><br/>${fields}"]\n`;
    }
    
    // Add relationships as edges
    for (const rel of doc.relationships) {
      const arrow = rel.type === 'one-to-many' ? '-->' : '---';
      mermaid += `  ${rel.from} ${arrow} ${rel.to}\n`;
    }

    const outputPath = path.join(outputDir, 'schema-erd.mermaid');
    fs.writeFileSync(outputPath, mermaid);
    logger.info(`✅ ER Diagram saved to ${outputPath}`);
  }

  private getModelDescription(modelName: string): string {
    const descriptions: Record<string, string> = {
      'User': 'Represents a user in the system (player, coach, or admin)',
      'Team': 'Represents a football team',
      'TeamMember': 'Junction table for user-team relationships',
      'FoodEntry': 'Records food consumption entries with nutrition analysis',
      'PerformanceMetric': 'Tracks daily performance and recovery metrics'
    };
    return descriptions[modelName] || `${modelName} model`;
  }

  private getFieldDescription(fieldName: string): string {
    const descriptions: Record<string, string> = {
      'id': 'Unique identifier',
      'email': 'User email address',
      'name': 'Display name',
      'age': 'User age in years',
      'role': 'User role in the system',
      'position': 'Player position on the field',
      'teamId': 'Reference to team',
      'userId': 'Reference to user',
      'date': 'Date of entry',
      'mealType': 'Type of meal',
      'nutritionScore': 'Calculated nutrition score (0-100)',
      'createdAt': 'Record creation timestamp',
      'updatedAt': 'Last update timestamp'
    };
    return descriptions[fieldName] || fieldName;
  }

  private getEnumDescription(enumName: string): string {
    const descriptions: Record<string, string> = {
      'UserRole': 'Defines user roles in the system',
      'PlayerPosition': 'Football player positions',
      'MealType': 'Types of meals throughout the day'
    };
    return descriptions[enumName] || `${enumName} enumeration`;
  }
}

export default SchemaDocumentationGenerator;