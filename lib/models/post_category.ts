import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { PostCategorySchema } from '../types';

export = (ctx: Hexo) => {
  const PostCategory = new warehouse.Schema<PostCategorySchema>({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    category_id: {type: warehouse.Schema.Types.CUID, ref: 'Category'}
  });

  return PostCategory;
};
