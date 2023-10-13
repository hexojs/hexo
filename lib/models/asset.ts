import warehouse from 'warehouse';
import { join } from 'path';

export = ctx => {
  const Asset = new warehouse.Schema({
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
