'use strict';

var Schema = require('warehouse').Schema;

module.exports = function(ctx) {
  var PostCategory = new Schema({
    post_id: {type: Schema.Types.CUID, ref: 'Post'},
    category_id: {type: Schema.Types.CUID, ref: 'Category'}
  });

  return PostCategory;
};
