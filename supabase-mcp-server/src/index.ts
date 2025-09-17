#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'supabase-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute a SELECT query on Supabase',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'The table name to query',
          },
          columns: {
            type: 'string',
            description: 'Comma-separated column names (default: *)',
            default: '*',
          },
          filters: {
            type: 'object',
            description: 'Filter conditions as key-value pairs',
            additionalProperties: true,
          },
          orderBy: {
            type: 'string',
            description: 'Column to order by',
          },
          ascending: {
            type: 'boolean',
            description: 'Sort ascending (true) or descending (false)',
            default: true,
          },
          limit: {
            type: 'number',
            description: 'Maximum number of rows to return',
          },
        },
        required: ['table'],
      },
    },
    {
      name: 'insert',
      description: 'Insert data into a Supabase table',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'The table name to insert into',
          },
          data: {
            type: 'object',
            description: 'The data to insert',
            additionalProperties: true,
          },
          upsert: {
            type: 'boolean',
            description: 'Perform an upsert instead of insert',
            default: false,
          },
        },
        required: ['table', 'data'],
      },
    },
    {
      name: 'update',
      description: 'Update data in a Supabase table',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'The table name to update',
          },
          data: {
            type: 'object',
            description: 'The data to update',
            additionalProperties: true,
          },
          filters: {
            type: 'object',
            description: 'Filter conditions to identify rows to update',
            additionalProperties: true,
          },
        },
        required: ['table', 'data', 'filters'],
      },
    },
    {
      name: 'delete',
      description: 'Delete data from a Supabase table',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'The table name to delete from',
          },
          filters: {
            type: 'object',
            description: 'Filter conditions to identify rows to delete',
            additionalProperties: true,
          },
        },
        required: ['table', 'filters'],
      },
    },
    {
      name: 'rpc',
      description: 'Call a Supabase RPC function',
      inputSchema: {
        type: 'object',
        properties: {
          functionName: {
            type: 'string',
            description: 'The RPC function name',
          },
          params: {
            type: 'object',
            description: 'Parameters to pass to the function',
            additionalProperties: true,
          },
        },
        required: ['functionName'],
      },
    },
  ],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query': {
        const { table, columns = '*', filters = {}, orderBy, ascending = true, limit } = args as any;
        
        let query = supabase.from(table).select(columns);
        
        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          if (typeof value === 'object' && value !== null) {
            // Handle complex filters like {gt: 5, lt: 10}
            for (const [operator, operand] of Object.entries(value as Record<string, any>)) {
              query = (query as any)[operator](key, operand);
            }
          } else {
            // Simple equality filter
            query = query.eq(key, value);
          }
        }
        
        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy, { ascending });
        }
        
        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(`Query error: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data }, null, 2),
            },
          ],
        };
      }

      case 'insert': {
        const { table, data, upsert = false } = args as any;
        
        const operation = upsert 
          ? supabase.from(table).upsert(data)
          : supabase.from(table).insert(data);
        
        const { data: result, error } = await operation.select();
        
        if (error) {
          throw new Error(`Insert error: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data: result }, null, 2),
            },
          ],
        };
      }

      case 'update': {
        const { table, data, filters } = args as any;
        
        let query = supabase.from(table).update(data);
        
        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
        
        const { data: result, error } = await query.select();
        
        if (error) {
          throw new Error(`Update error: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data: result }, null, 2),
            },
          ],
        };
      }

      case 'delete': {
        const { table, filters } = args as any;
        
        let query = supabase.from(table).delete();
        
        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
        
        const { data: result, error } = await query.select();
        
        if (error) {
          throw new Error(`Delete error: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, deleted: result }, null, 2),
            },
          ],
        };
      }

      case 'rpc': {
        const { functionName, params = {} } = args as any;
        
        const { data, error } = await supabase.rpc(functionName, params);
        
        if (error) {
          throw new Error(`RPC error: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, data }, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Supabase MCP server started');
}

main().catch(console.error);