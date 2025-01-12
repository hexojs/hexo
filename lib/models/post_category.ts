import warehouse from 'warehouse';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const PostCategory = new warehouse.Schema({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    category_id: {type: warehouse.Schema.Types.CUID, ref: 'Category'}
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
