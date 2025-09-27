/**
 * ESLint rule to ensure platform-specific files have corresponding base implementations
 * This helps maintain consistency across platforms
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure platform-specific files have corresponding base implementations',
      category: 'Best Practices',
      recommended: true
    },
    messages: {
      missingNativeFile: 'Web-specific file "{{filename}}" missing corresponding native implementation at "{{expectedPath}}"',
      missingWebFile: 'Native file "{{filename}}" could benefit from a web-specific implementation at "{{expectedPath}}" if it has web-specific optimizations',
      interfaceMismatch: 'Interface mismatch between "{{filename}}" and its platform counterpart'
    },
    schema: [
      {
        type: 'object',
        properties: {
          requireWebVersions: {
            type: 'boolean',
            default: false
          },
          checkInterfaces: {
            type: 'boolean',
            default: true
          },
          ignorePaths: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: ['node_modules', 'build', 'dist', '.next', 'coverage']
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const requireWebVersions = options.requireWebVersions || false;
    const checkInterfaces = options.checkInterfaces || true;
    const ignorePaths = options.ignorePaths || ['node_modules', 'build', 'dist', '.next', 'coverage'];

    return {
      Program(node) {
        const filename = context.getFilename();

        // Skip if in ignored paths
        if (ignorePaths.some(ignorePath => filename.includes(ignorePath))) {
          return;
        }

        // Check .web.tsx/jsx files
        if (filename.match(/\.web\.(tsx?|jsx?)$/)) {
          const baseFile = filename.replace(/\.web(\.(tsx?|jsx?))$/, '$1');

          if (!fs.existsSync(baseFile)) {
            context.report({
              node,
              messageId: 'missingNativeFile',
              data: {
                filename: path.basename(filename),
                expectedPath: path.basename(baseFile)
              }
            });
          } else if (checkInterfaces) {
            // Could add interface checking logic here
            // This would require parsing both files and comparing interfaces
            // For now, we'll leave this as a placeholder for future enhancement
          }
        }

        // Check regular component files if requireWebVersions is true
        if (requireWebVersions && filename.match(/^((?!\.web\.).)*\.(tsx?|jsx?)$/)) {
          // Skip test files and config files
          if (filename.includes('.test.') ||
              filename.includes('.spec.') ||
              filename.includes('.config.') ||
              filename.includes('setupTests') ||
              filename.includes('test-utils')) {
            return;
          }

          const webFile = filename.replace(/(\.(tsx?|jsx?))$/, '.web$1');
          const fileContent = context.getSourceCode().text;

          // Check if file might benefit from web version
          // Look for indicators like complex UI, animations, or web-specific features
          const needsWebVersion =
            fileContent.includes('ScrollView') ||
            fileContent.includes('FlatList') ||
            fileContent.includes('Animated') ||
            fileContent.includes('Modal') ||
            fileContent.includes('KeyboardAvoidingView');

          if (needsWebVersion && !fs.existsSync(webFile)) {
            // This is just a suggestion, not an error
            context.report({
              node,
              messageId: 'missingWebFile',
              data: {
                filename: path.basename(filename),
                expectedPath: path.basename(webFile)
              }
            });
          }
        }
      }
    };
  }
};