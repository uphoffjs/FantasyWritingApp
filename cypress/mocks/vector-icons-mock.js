/**
 * Mock for react-native-vector-icons
 * Used in Cypress tests to prevent import errors
 */

const Icon = ({ name, size, color, ...props }) => null;

Icon.loadFont = () => Promise.resolve();
Icon.hasIcon = () => Promise.resolve(true);
Icon.getImageSource = () => Promise.resolve({});
Icon.getImageSourceSync = () => ({});

module.exports = Icon;
module.exports.default = Icon;

// Export individual icon sets
const iconSets = [
  'AntDesign',
  'Entypo',
  'EvilIcons',
  'Feather',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome5Pro',
  'Foundation',
  'Ionicons',
  'MaterialCommunityIcons',
  'MaterialIcons',
  'Octicons',
  'SimpleLineIcons',
  'Zocial',
];

iconSets.forEach(iconSet => {
  module.exports[iconSet] = Icon;
});