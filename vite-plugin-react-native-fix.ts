// * Custom Vite plugin to handle React Native Flow types issue
// ! This plugin intercepts and replaces react-native imports before esbuild processes them

export function reactNativeFixPlugin() {
  return {
    name: 'react-native-fix',
    enforce: 'pre' as const, // ! Run before other plugins

    resolveId(id: string) {
      // * Intercept any react-native imports
      if (id === 'react-native' || id.startsWith('react-native/')) {
        // * Force resolution to react-native-web
        if (id === 'react-native') {
          return 'react-native-web';
        }
        // * Replace react-native/ paths with react-native-web equivalents
        return id.replace('react-native/', 'react-native-web/dist/');
      }
      return null;
    },

    transform(code: string, id: string) {
      // * Skip if not JavaScript/TypeScript
      if (!/\.[jt]sx?$/.test(id)) {
        return null;
      }

      // * Replace any remaining react-native imports in the code
      if (code.includes('react-native')) {
        const transformed = code
          .replace(/from\s+['"]react-native['"]/g, 'from "react-native-web"')
          .replace(/require\(['"]react-native['"]\)/g, 'require("react-native-web")')
          .replace(/import\(['"]react-native['"]\)/g, 'import("react-native-web")');

        if (transformed !== code) {
          return {
            code: transformed,
            map: null
          };
        }
      }

      return null;
    }
  };
}