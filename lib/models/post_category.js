'use strict';

const Schema = require('warehouse').Schema;

module.exports = ctx => {
  const PostCategory = new Schema({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    category_id: {type: Schema.Types.CUID, ref: 'Category'}
  });

  return PostCategory;
};
