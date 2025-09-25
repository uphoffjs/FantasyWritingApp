#!/usr/bin/env node

/**
 * generate-factory.js
 * * CLI tool to generate test factory functions
 * ! Helps maintain consistent factory patterns across the codebase
 *
 * Usage: npm run generate:factory
 * or: node scripts/generate-factory.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// * Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// * Common property types and their default values
const defaultValues = {
  string: "''",
  number: '0',
  boolean: 'false',
  date: 'new Date()',
  array: '[]',
  object: '{}',
  id: "generateId('entity')",
  uuid: "crypto.randomUUID()",
  email: "'test@example.com'",
  url: "'https://example.com'",
  percentage: '0',
  enum: "'pending'"
};

// * Common entity types and their typical properties
const entityTemplates = {
  element: {
    id: 'id',
    name: 'string',
    type: 'string',
    category: 'string',
    description: 'string',
    projectId: 'id',
    completionPercentage: 'percentage',
    createdAt: 'date',
    updatedAt: 'date'
  },
  project: {
    id: 'id',
    name: 'string',
    description: 'string',
    genre: 'string',
    targetWordCount: 'number',
    currentWordCount: 'number',
    isActive: 'boolean',
    createdAt: 'date',
    updatedAt: 'date'
  },
  question: {
    id: 'id',
    text: 'string',
    type: 'enum',
    required: 'boolean',
    category: 'string',
    placeholder: 'string',
    options: 'array',
    validation: 'object'
  },
  user: {
    id: 'id',
    email: 'email',
    name: 'string',
    avatar: 'url',
    role: 'enum',
    isActive: 'boolean',
    createdAt: 'date',
    updatedAt: 'date'
  },
  relationship: {
    id: 'id',
    fromId: 'id',
    toId: 'id',
    type: 'string',
    description: 'string',
    strength: 'percentage',
    createdAt: 'date'
  }
};

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function generateFactoryCode(name, properties) {
  const factoryName = name.charAt(0).toLowerCase() + name.slice(1) + 'Factory';
  const interfaceName = name.charAt(0).toUpperCase() + name.slice(1);

  const code = `/**
 * ${factoryName}
 * * Factory function for creating test ${interfaceName} objects
 * Generated on: ${new Date().toISOString().split('T')[0]}
 */

import { generateId } from '../utils/test-helpers';

export interface Test${interfaceName} {
${properties.map(p => `  ${p.name}${p.required ? '' : '?'}: ${getTypeScriptType(p.type)};`).join('\n')}
}

export const ${factoryName} = (overrides: Partial<Test${interfaceName}> = {}): Test${interfaceName} => {
  return {
${properties.map(p => {
  const defaultVal = p.customDefault || defaultValues[p.type] || "''";
  return `    ${p.name}: overrides.${p.name} !== undefined ? overrides.${p.name} : ${defaultVal},`;
}).join('\n')}
    ...overrides // * Allow additional properties
  };
};

// * Batch creation helper
export const create${interfaceName}s = (count: number = 3, overrides: Partial<Test${interfaceName}> = {}): Test${interfaceName}[] => {
  return Array.from({ length: count }, (_, index) =>
    ${factoryName}({
      ...overrides,
      id: generateId('${name.toLowerCase()}-' + (index + 1)),
      name: overrides.name || \`Test ${interfaceName} \${index + 1}\`
    })
  );
};
`;

  return code;
}

function getTypeScriptType(type) {
  const typeMap = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    array: 'any[]',
    object: 'Record<string, any>',
    id: 'string',
    uuid: 'string',
    email: 'string',
    url: 'string',
    percentage: 'number',
    enum: 'string'
  };
  return typeMap[type] || 'any';
}

async function main() {
  console.log(`\n${colors.cyan}${colors.bright}🏭 Factory Generator CLI${colors.reset}\n`);

  // * Ask for entity name
  const entityName = await prompt(`${colors.blue}Enter entity name (e.g., 'Element', 'Project'): ${colors.reset}`);

  // * Check if there's a template
  const templateKey = entityName.toLowerCase();
  let useTemplate = false;

  if (entityTemplates[templateKey]) {
    const useTemplateAnswer = await prompt(`${colors.yellow}Found template for '${entityName}'. Use it? (y/n): ${colors.reset}`);
    useTemplate = useTemplateAnswer.toLowerCase() === 'y';
  }

  let properties = [];

  if (useTemplate) {
    // * Use template properties
    const template = entityTemplates[templateKey];
    properties = Object.entries(template).map(([name, type]) => ({
      name,
      type,
      required: true
    }));

    console.log(`\n${colors.green}Using template with ${properties.length} properties:${colors.reset}`);
    properties.forEach(p => {
      console.log(`  - ${p.name}: ${p.type}`);
    });
  } else {
    // * Custom properties
    console.log(`\n${colors.yellow}Define properties (enter empty name to finish):${colors.reset}`);
    console.log(`Available types: ${Object.keys(defaultValues).join(', ')}\n`);

    while (true) {
      const propName = await prompt(`  Property name: `);
      if (!propName) break;

      const propType = await prompt(`  Property type (default: string): `) || 'string';
      const required = await prompt(`  Required? (y/n, default: y): `);

      let customDefault = null;
      if (propType === 'string') {
        const defaultVal = await prompt(`  Default value (optional): `);
        if (defaultVal) {
          customDefault = `'${defaultVal}'`;
        }
      }

      properties.push({
        name: propName,
        type: propType,
        required: required.toLowerCase() !== 'n',
        customDefault
      });

      console.log('');
    }
  }

  if (properties.length === 0) {
    console.log(`${colors.yellow}No properties defined. Exiting.${colors.reset}`);
    rl.close();
    return;
  }

  // * Generate the factory code
  const code = generateFactoryCode(entityName, properties);

  // * Ask where to save
  const defaultPath = `cypress/fixtures/factories/${entityName.toLowerCase()}-factory.ts`;
  const savePath = await prompt(`\n${colors.blue}Save to (default: ${defaultPath}): ${colors.reset}`) || defaultPath;

  // * Ensure directory exists
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // * Write the file
  fs.writeFileSync(savePath, code);

  console.log(`\n${colors.green}✅ Factory generated successfully!${colors.reset}`);
  console.log(`   File: ${savePath}`);

  // * Update factories index if it exists
  const indexPath = path.join(dir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const shouldUpdate = await prompt(`\n${colors.yellow}Update index.ts to export the new factory? (y/n): ${colors.reset}`);
    if (shouldUpdate.toLowerCase() === 'y') {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const factoryName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Factory';
      const exportLine = `export { ${factoryName}, create${entityName}s } from './${path.basename(savePath, '.ts')}';`;

      if (!indexContent.includes(exportLine)) {
        fs.appendFileSync(indexPath, `\n${exportLine}`);
        console.log(`${colors.green}✅ Updated index.ts${colors.reset}`);
      }
    }
  }

  // * Show usage example
  console.log(`\n${colors.cyan}Usage example:${colors.reset}`);
  console.log(`\`\`\`typescript`);
  console.log(`import { ${entityName.toLowerCase()}Factory } from '${savePath.replace('.ts', '')}';`);
  console.log(``);
  console.log(`const test${entityName} = ${entityName.toLowerCase()}Factory({`);
  console.log(`  name: 'Custom Name'`);
  console.log(`});`);
  console.log(`\`\`\``);

  rl.close();
}

// * Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

// * Run the CLI
main().catch(error => {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});