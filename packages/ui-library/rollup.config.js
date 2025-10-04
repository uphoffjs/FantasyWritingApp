// * Rollup configuration for building the component library
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    // * Automatically externalize peer dependencies
    peerDepsExternal(),
    
    // * Resolve node modules
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    
    // * Convert CommonJS modules to ES6
    commonjs(),
    
    // * Compile TypeScript
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx']
    }),
    
    // * Minify production builds
    terser()
  ],
  external: ['react', 'react-dom', 'react-native', 'react-native-web']
};