import * as models from '../models/index.js';
import type Hexo from './index.js';

const registerModels = (ctx: Hexo): void => {
  const db = ctx.database;

  const keys = Object.keys(models);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    db.model(key, models[key](ctx));
  }
};

// For ESM compatibility
export default registerModels;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = registerModels;
  // For ESM compatibility
  module.exports.default = registerModels;
}
