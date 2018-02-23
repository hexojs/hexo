'use strict';

const Schema = require('warehouse').Schema;

module.exports = ctx => {
  const PostTag = new Schema({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: Schema.Types.CUID, ref: 'Tag'}
  });

  return PostTag;
};
