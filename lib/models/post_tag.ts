import Schema from 'warehouse/dist/schema';
import type Hexo from '../hexo/index.js';
import { PostTagSchema } from '../types.js';

const postTag = (ctx: Hexo) => {
  const PostTag = new Schema<PostTagSchema>({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: Schema.Types.CUID, ref: 'Tag'}
  });

  PostTag.pre('save', data => {
    ctx._binaryRelationIndex.post_tag.removeHook(data);
    return data;
  });

  PostTag.post('save', data => {
    ctx._binaryRelationIndex.post_tag.saveHook(data);
    return data;
  });

  PostTag.pre('remove', data => {
    ctx._binaryRelationIndex.post_tag.removeHook(data);
    return data;
  });

  return PostTag;
};

// For ESM compatibility
export default postTag;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = postTag;
  // For ESM compatibility
  module.exports.default = postTag;
}
