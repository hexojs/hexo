import warehouse from 'warehouse';

export default ctx => {
  const PostCategory = new warehouse.Schema({
    post_id: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    category_id: {type: warehouse.Schema.Types.CUID, ref: 'Category'}
  });

  return PostCategory;
};
