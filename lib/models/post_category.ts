import Schema from 'warehouse/dist/schema';
import type Hexo from '../hexo/index.js';
import { PostCategorySchema } from '../types.js';

const postCategory = (ctx: Hexo) => {
  const PostCategory = new Schema<PostCategorySchema>({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    category_id: {type: Schema.Types.CUID, ref: 'Category'}
  });

  PostCategory.pre('save', data => {
    ctx._binaryRelationIndex.post_category.removeHook(data);
    return data;
  });

  PostCategory.post('save', data => {
    ctx._binaryRelationIndex.post_category.saveHook(data);
    return data;
  });

  PostCategory.pre('remove', data => {
    ctx._binaryRelationIndex.post_category.removeHook(data);
    return data;
  });

  return PostCategory;
};

// For ESM compatibility
export default postCategory;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = postCategory;
  // For ESM compatibility
  module.exports.default = postCategory;
}
