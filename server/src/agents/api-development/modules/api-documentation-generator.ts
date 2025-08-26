import * as fs from 'fs';
import * as path from 'path';
import { ApiAgentConfig } from '../config/agent.config';
import { ApiEndpoint } from '../index';
import { logger } from '../utils/logger';

export class ApiDocumentationGenerator {
  private config: ApiAgentConfig;

  constructor(config: ApiAgentConfig) {
    this.config = config;
  }

  async generate(options: {
    endpoints: ApiEndpoint[];
    format: 'openapi' | 'postman' | 'markdown';
    includeExamples: boolean;
  }): Promise<string> {
    switch (options.format) {
      case 'openapi':
        return this.generateOpenAPI(options.endpoints, options.includeExamples);
      case 'postman':
        return this.generatePostmanCollection(options.endpoints);
      case 'markdown':
        return this.generateMarkdown(options.endpoints);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private generateOpenAPI(endpoints: ApiEndpoint[], includeExamples: boolean): string {
    const spec = {
      openapi: this.config.documentation.openApiVersion,
      info: {
        title: 'Junior Football Nutrition Tracker API',
        version: '1.0.0',
        description: 'API for managing nutrition tracking for junior football players'
      },
      servers: this.config.documentation.servers,
      paths: this.generatePaths(endpoints, includeExamples),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    return JSON.stringify(spec, null, 2);
  }

  private generatePaths(endpoints: ApiEndpoint[], includeExamples: boolean): any {
    const paths: any = {};

    for (const endpoint of endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        tags: endpoint.tags || [],
        security: endpoint.middleware?.length ? [{ bearerAuth: [] }] : [],
        responses: {
          200: {
            description: 'Success',
            content: includeExamples ? {
              'application/json': {
                example: { data: {}, meta: {} }
              }
            } : undefined
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Not Found' },
          500: { description: 'Internal Server Error' }
        }
      };
    }

    return paths;
  }

  private generatePostmanCollection(endpoints: ApiEndpoint[]): string {
    const collection = {
      info: {
        name: 'Junior Football Nutrition Tracker API',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: endpoints.map(endpoint => ({
        name: endpoint.description || endpoint.path,
        request: {
          method: endpoint.method,
          url: {
            raw: `{{baseUrl}}${endpoint.path}`,
            host: ['{{baseUrl}}'],
            path: endpoint.path.split('/').filter(p => p)
          },
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            }
          ]
        }
      }))
    };

    return JSON.stringify(collection, null, 2);
  }

  private generateMarkdown(endpoints: ApiEndpoint[]): string {
    let markdown = '# API Documentation\n\n';
    markdown += '## Base URL\n\n';
    markdown += `${this.config.documentation.servers[0].url}\n\n`;
    markdown += '## Endpoints\n\n';

    const grouped = this.groupEndpointsByTag(endpoints);

    for (const [tag, tagEndpoints] of grouped) {
      markdown += `### ${tag}\n\n`;
      
      for (const endpoint of tagEndpoints) {
        markdown += `#### ${endpoint.method} ${endpoint.path}\n\n`;
        markdown += `${endpoint.description || 'No description'}\n\n`;
        
        if (endpoint.validation) {
          markdown += '**Request Body:**\n```json\n';
          markdown += JSON.stringify(endpoint.validation, null, 2);
          markdown += '\n```\n\n';
        }
        
        markdown += '**Response:**\n```json\n';
        markdown += '{\n  "data": {},\n  "meta": {}\n}\n';
        markdown += '```\n\n';
      }
    }

    return markdown;
  }

  private groupEndpointsByTag(endpoints: ApiEndpoint[]): Map<string, ApiEndpoint[]> {
    const grouped = new Map<string, ApiEndpoint[]>();
    
    for (const endpoint of endpoints) {
      const tags = endpoint.tags || ['General'];
      for (const tag of tags) {
        if (!grouped.has(tag)) {
          grouped.set(tag, []);
        }
        grouped.get(tag)!.push(endpoint);
      }
    }
    
    return grouped;
  }

  async saveToFile(content: string, outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, content);
    logger.info(`Documentation saved to: ${outputPath}`);
  }
}

export default ApiDocumentationGenerator;