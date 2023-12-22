import warehouse from 'warehouse';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const PostCategory = new warehouse.Schema({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    category_id: {type: warehouse.Schema.Types.CUID, ref: 'Category'}
  });

  return PostCategory;
};
