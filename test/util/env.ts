import path from 'path';
import fs from 'fs';
import { getDirname } from '../../lib/hexo/cross_dirname.js';

export const testCwd = path.join(getDirname(), '../../tmp/test-hexo-project');
fs.mkdirSync(testCwd, { recursive: true });
