/**
 * ESLint rule to ensure testID presence on interactive components
 * This helps maintain testability across all platforms
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require testID prop on interactive React Native components',
      category: 'Testing',
      recommended: true
    },
    messages: {
      missingTestID: '{{component}} should have a testID prop for testing',
      missingDataTestId: 'Web components should have data-testid attribute for testing'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: [
              'TouchableOpacity',
              'TouchableHighlight',
              'TouchableWithoutFeedback',
              'Pressable',
              'Button',
              'TextInput',
              'Switch',
              'Slider',
              'Picker'
            ]
          },
          webElements: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: ['button', 'input', 'select', 'textarea', 'form']
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const components = options.components || [
      'TouchableOpacity',
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'Pressable',
      'Button',
      'TextInput',
      'Switch',
      'Slider',
      'Picker'
    ];
    const webElements = options.webElements || [
      'button',
      'input',
      'select',
      'textarea',
      'form'
    ];

    const filename = context.getFilename();
    const isWebFile = filename.includes('.web.');

    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;

        // Check React Native components
        if (!isWebFile && components.includes(elementName)) {
          const hasTestID = node.attributes.some(attr =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            attr.name.name === 'testID'
          );

          if (!hasTestID) {
            context.report({
              node,
              messageId: 'missingTestID',
              data: {
                component: elementName
              },
              fix(fixer) {
                // Add testID with a generated value based on component type
                const testIDValue = `${elementName.toLowerCase()}-${Date.now()}`;
                const lastAttribute = node.attributes[node.attributes.length - 1];

                if (lastAttribute) {
                  return fixer.insertTextAfter(
                    lastAttribute,
                    ` testID="${testIDValue}"`
                  );
                } else {
                  return fixer.insertTextAfter(
                    node.name,
                    ` testID="${testIDValue}"`
                  );
                }
              }
            });
          }
        }

        // Check HTML elements in web files
        if (isWebFile && webElements.includes(elementName)) {
          const hasDataTestId = node.attributes.some(attr =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            (attr.name.name === 'data-testid' || attr.name.name === 'data-cy')
          );

          if (!hasDataTestId) {
            context.report({
              node,
              messageId: 'missingDataTestId',
              fix(fixer) {
                // Add data-testid with a generated value
                const testIDValue = `${elementName}-${Date.now()}`;
                const lastAttribute = node.attributes[node.attributes.length - 1];

                if (lastAttribute) {
                  return fixer.insertTextAfter(
                    lastAttribute,
                    ` data-testid="${testIDValue}"`
                  );
                } else {
                  return fixer.insertTextAfter(
                    node.name,
                    ` data-testid="${testIDValue}"`
                  );
                }
              }
            });
          }
        }
      }
    };
  }
};