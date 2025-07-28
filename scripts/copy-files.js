
// This script copies files to their correct destinations for the build process.

const fs = require('fs');
const path = require('path');

function copyFileSync(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

const baseDir = path.resolve(__dirname, '..');

// Copy package.json to dist/
copyFileSync(
  path.join(baseDir, 'package.json'),
  path.join(baseDir, 'dist/package.json')
);

// Copy globals.d.ts to dist/esm/hexo/globals.d.ts
copyFileSync(
  path.join(baseDir, 'lib/hexo/globals.d.ts'),
  path.join(baseDir, 'dist/esm/hexo/globals.d.ts')
);

// Copy globals.d.ts to dist/cjs/hexo/globals.d.ts
copyFileSync(
  path.join(baseDir, 'lib/hexo/globals.d.ts'),
  path.join(baseDir, 'dist/cjs/hexo/globals.d.ts')
);
