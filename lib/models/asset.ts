import warehouse from 'warehouse';
import { join } from 'path';
import type Hexo from '../hexo/index.js';
import type { AssetSchema } from '../types.js';

const asset = (ctx: Hexo) => {
  const Asset = new warehouse.Schema<AssetSchema>({
    _id: {type: String, required: true},
    path: {type: String, required: true},
    modified: {type: Boolean, default: true},
    renderable: {type: Boolean, default: true}
  });

  Asset.virtual('source').get(function() {
    return join(ctx.base_dir, this._id);
  });

  return Asset;
};

// For ESM compatibility
export default asset;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = asset;
  // For ESM compatibility
  module.exports.default = asset;
}
