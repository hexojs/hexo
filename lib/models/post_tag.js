'use strict';

var Schema = require('warehouse').Schema;

module.exports = function(ctx) {
  var PostTag = new Schema({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    tag_id: {type: Schema.Types.CUID, ref: 'Tag'}
  });

  return PostTag;
};
