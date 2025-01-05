import warehouse from 'warehouse';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const PostTag = new warehouse.Schema({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: warehouse.Schema.Types.CUID, ref: 'Tag'}
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
