import {Schema} from 'warehouse';

export default ctx => {
  const PostTag = new Schema({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: Schema.Types.CUID, ref: 'Tag'}
  });

  return PostTag;
};
