import warehouse from 'warehouse';
import type Hexo from '../hexo';
import { PostTagSchema } from '../types';

export = (ctx: Hexo) => {
  const PostTag = new warehouse.Schema<PostTagSchema>({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: warehouse.Schema.Types.CUID, ref: 'Tag'}
  });

  return PostTag;
};
