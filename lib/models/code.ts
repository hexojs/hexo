import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { CodeSchema } from '../types';
import { join } from 'path';

export = (ctx: Hexo) => {
  const Code = new warehouse.Schema<CodeSchema>({
    _id: { type: String, required: true },
    path: { type: String, required: true },
    slug: { type: String, required: true },
    modified: { type: Boolean, default: true },
    content: { type: String, default: '' }
  });

  Code.virtual('source').get(function() {
    return join(ctx.base_dir, this._id);
  });

  return Code;
};
