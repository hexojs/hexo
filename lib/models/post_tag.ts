import warehouse from 'warehouse';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const PostTag = new warehouse.Schema({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: warehouse.Schema.Types.CUID, ref: 'Tag'}
  });

  return PostTag;
};
