// * Script to update asset imports for Vite
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Update image imports
  content = content.replace(
    /require\(['"](.+\.(png|jpg|jpeg|gif|svg))['"]\)/g,
    "new URL('$1', import.meta.url).href"
  );

  // Update dynamic imports
  content = content.replace(
    /import\((.+)\)/g,
    (match, p1) => {
      if (p1.includes('webpackChunkName')) {
        // Remove webpack comments
        return `import(${p1.replace(/\/\*.*?\*\//g, '')})`;
      }
      return match;
    }
  );

  fs.writeFileSync(file, content);
});

console.log('✅ Asset migration complete');