#!/usr/bin/env node

/**
 * Supabase CLI Tool
 * Execute SQL queries directly against your Supabase database from the command line
 * 
 * Usage:
 *   node scripts/supabase-cli.js "SELECT * FROM projects LIMIT 5"
 *   node scripts/supabase-cli.js --file scripts/simple-fix-rls.sql
 *   node scripts/supabase-cli.js --interactive
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// * Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// * Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error(`${colors.red}❌ Missing Supabase credentials in .env file${colors.reset}`);
  console.error(`${colors.yellow}Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set${colors.reset}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// * Command line argument parser
function parseArgs(args) {
  const options = {
    query: null,
    file: null,
    interactive: false,
    help: false,
    table: null,
    operation: 'select', // select, insert, update, delete
    data: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--interactive' || arg === '-i') {
      options.interactive = true;
    } else if (arg === '--file' || arg === '-f') {
      options.file = args[++i];
    } else if (arg === '--table' || arg === '-t') {
      options.table = args[++i];
    } else if (arg === '--insert') {
      options.operation = 'insert';
      options.data = args[++i];
    } else if (arg === '--update') {
      options.operation = 'update';
      options.data = args[++i];
    } else if (arg === '--delete') {
      options.operation = 'delete';
    } else if (!arg.startsWith('-')) {
      options.query = arg;
    }
  }

  return options;
}

// * Display help message
function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}Supabase CLI Tool${colors.reset}
${colors.green}Execute queries against your Supabase database${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/supabase-cli.js [options] [query]

${colors.yellow}Options:${colors.reset}
  -h, --help          Show this help message
  -i, --interactive   Start interactive mode
  -f, --file <path>   Execute SQL from file
  -t, --table <name>  Specify table for operations
  --insert <json>     Insert data (JSON format)
  --update <json>     Update data (JSON format)
  --delete            Delete data (use with filters)

${colors.yellow}Examples:${colors.reset}
  ${colors.blue}# Direct query${colors.reset}
  node scripts/supabase-cli.js "SELECT * FROM projects LIMIT 5"
  
  ${colors.blue}# Execute SQL file${colors.reset}
  node scripts/supabase-cli.js --file scripts/simple-fix-rls.sql
  
  ${colors.blue}# Interactive mode${colors.reset}
  node scripts/supabase-cli.js --interactive
  
  ${colors.blue}# Table operations${colors.reset}
  node scripts/supabase-cli.js --table projects "select('*').limit(5)"
  node scripts/supabase-cli.js --table projects --insert '{"name":"Test","user_id":"..."}'
  
  ${colors.blue}# Apply RLS fixes${colors.reset}
  node scripts/supabase-cli.js --file scripts/simple-fix-rls.sql
`);
}

// * Execute a SQL query using Supabase RPC
async function executeSQLQuery(sql) {
  try {
    console.log(`${colors.cyan}📋 Executing query...${colors.reset}`);
    
    // * Use Supabase's raw SQL execution via RPC (if available)
    // * Note: This requires a custom RPC function in Supabase
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    
    if (error) {
      // * Fallback: Try to parse and execute as table operation
      return executeTableOperation(sql);
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// * Execute table operations using Supabase client
async function executeTableOperation(query) {
  try {
    // * Parse simple SELECT queries
    const selectMatch = query.match(/SELECT\s+\*\s+FROM\s+(\w+)(\s+WHERE\s+(.+?))?(\s+LIMIT\s+(\d+))?/i);
    if (selectMatch) {
      const table = selectMatch[1];
      const whereClause = selectMatch[3];
      const limit = selectMatch[5];
      
      let queryBuilder = supabase.from(table).select('*');
      
      if (whereClause) {
        // * Simple WHERE parsing (basic support)
        const whereMatch = whereClause.match(/(\w+)\s*=\s*['"]?([^'"]+)['"]?/);
        if (whereMatch) {
          queryBuilder = queryBuilder.eq(whereMatch[1], whereMatch[2]);
        }
      }
      
      if (limit) {
        queryBuilder = queryBuilder.limit(parseInt(limit));
      }
      
      const { data, error } = await queryBuilder;
      return { data, error };
    }

    // * Parse INSERT queries
    const insertMatch = query.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (insertMatch) {
      const table = insertMatch[1];
      const columns = insertMatch[2].split(',').map(c => c.trim());
      const values = insertMatch[3].split(',').map(v => v.trim().replace(/['"]/g, ''));
      
      const insertData = {};
      columns.forEach((col, i) => {
        insertData[col] = values[i];
      });
      
      const { data, error } = await supabase.from(table).insert(insertData);
      return { data, error };
    }

    return { 
      data: null, 
      error: 'Query type not supported. Use Supabase client methods or execute SQL file in Supabase Dashboard.' 
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// * Execute query from file
async function executeFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const sql = await fs.readFile(absolutePath, 'utf8');
    
    console.log(`${colors.cyan}📄 Executing SQL from file: ${filePath}${colors.reset}`);
    console.log(`${colors.yellow}Note: Complex SQL files should be executed in Supabase Dashboard${colors.reset}`);
    
    // * For complex SQL files, provide instructions
    if (sql.includes('CREATE POLICY') || sql.includes('ALTER TABLE') || sql.includes('DROP POLICY')) {
      console.log(`\n${colors.yellow}⚠️  This file contains DDL statements (policies, table alterations).${colors.reset}`);
      console.log(`${colors.green}Please execute this file in your Supabase Dashboard:${colors.reset}`);
      console.log(`${colors.blue}1. Go to: ${supabaseUrl}/project/default/sql${colors.reset}`);
      console.log(`${colors.blue}2. Paste the SQL content${colors.reset}`);
      console.log(`${colors.blue}3. Click "Run"${colors.reset}\n`);
      
      // * Show the first few lines of the file
      const lines = sql.split('\n').slice(0, 10);
      console.log(`${colors.cyan}First 10 lines of the file:${colors.reset}`);
      lines.forEach((line, i) => {
        console.log(`${colors.bright}${i + 1}:${colors.reset} ${line}`);
      });
      
      return;
    }
    
    // * Try to execute simple queries
    return await executeSQLQuery(sql);
  } catch (err) {
    console.error(`${colors.red}❌ Error reading file: ${err.message}${colors.reset}`);
  }
}

// * Interactive mode
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}supabase> ${colors.reset}`
  });

  console.log(`${colors.green}${colors.bright}Supabase Interactive Mode${colors.reset}`);
  console.log(`${colors.yellow}Type 'help' for commands, 'exit' to quit${colors.reset}\n`);

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input === 'exit' || input === 'quit') {
      console.log(`${colors.green}Goodbye!${colors.reset}`);
      rl.close();
      process.exit(0);
    }
    
    if (input === 'help') {
      console.log(`
${colors.yellow}Commands:${colors.reset}
  help              Show this help
  tables            List all tables
  describe <table>  Show table structure
  select <table>    Select from table
  exit              Exit interactive mode
  
${colors.yellow}Or enter any SQL query${colors.reset}
`);
      rl.prompt();
      return;
    }
    
    if (input === 'tables') {
      // * List tables (requires introspection)
      const { data, error } = await supabase.from('projects').select('*').limit(0);
      if (!error) {
        console.log(`${colors.green}Available tables: projects, world_elements, relationships, questionnaire_templates${colors.reset}`);
      }
      rl.prompt();
      return;
    }
    
    if (input.startsWith('describe ')) {
      const table = input.replace('describe ', '').trim();
      console.log(`${colors.yellow}Table structure inspection requires Supabase Dashboard${colors.reset}`);
      console.log(`${colors.blue}Visit: ${supabaseUrl}/project/default/editor/${table}${colors.reset}`);
      rl.prompt();
      return;
    }
    
    if (input.startsWith('select ')) {
      const table = input.replace('select ', '').trim();
      const { data, error } = await supabase.from(table).select('*').limit(5);
      
      if (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Results:${colors.reset}`);
        console.table(data);
      }
      rl.prompt();
      return;
    }
    
    // * Try to execute as SQL
    if (input) {
      const result = await executeTableOperation(input);
      if (result.error) {
        console.error(`${colors.red}❌ Error: ${result.error}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Success${colors.reset}`);
        if (result.data) {
          console.table(result.data);
        }
      }
    }
    
    rl.prompt();
  });
}

// * Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log(`${colors.cyan}${colors.bright}🚀 Supabase CLI${colors.reset}`);
  console.log(`${colors.green}Connected to: ${supabaseUrl}${colors.reset}\n`);

  if (options.interactive) {
    await interactiveMode();
  } else if (options.file) {
    await executeFile(options.file);
  } else if (options.query) {
    const result = await executeTableOperation(options.query);
    if (result.error) {
      console.error(`${colors.red}❌ Error: ${result.error}${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Query executed successfully${colors.reset}`);
      if (result.data) {
        console.table(result.data);
      }
    }
  } else if (options.table) {
    // * Table-specific operations
    let result;
    
    switch (options.operation) {
      case 'insert':
        const insertData = JSON.parse(options.data || '{}');
        result = await supabase.from(options.table).insert(insertData);
        break;
      case 'update':
        const updateData = JSON.parse(options.data || '{}');
        result = await supabase.from(options.table).update(updateData);
        break;
      case 'delete':
        result = await supabase.from(options.table).delete();
        break;
      default:
        result = await supabase.from(options.table).select('*').limit(10);
    }
    
    if (result.error) {
      console.error(`${colors.red}❌ Error: ${result.error.message}${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Operation successful${colors.reset}`);
      if (result.data) {
        console.table(result.data);
      }
    }
  } else {
    showHelp();
  }
}

// * Run the CLI
main().catch(err => {
  console.error(`${colors.red}❌ Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});