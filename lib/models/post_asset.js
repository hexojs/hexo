'use strict';

var Schema = require('warehouse').Schema;
var pathFn = require('path');
const _ = require('lodash');

module.exports = function(ctx) {
  var PostAsset = new Schema({
    _id: {type: String, required: true},
    slug: {type: String, required: true},
    modified: {type: Boolean, default: true},
    post: {type: Schema.Types.CUID, ref: 'Post'},
    renderable: {type: Boolean, default: true}
  });

  PostAsset.virtual('path').get(function() {
    var Post = ctx.model('Post');
    var post = Post.findById(this.post);
    if (!post) return;

    // PostAsset.path is file path relative to `public_dir`
    // no need to urlescape, #1562
    // strip /\.html?$/ extensions on permalink, #2134
    return pathFn.join(_.replace(post.path, /\.html?$/, ''), this.slug);
  });

  PostAsset.virtual('source').get(function() {
    return pathFn.join(ctx.base_dir, this._id);
  });

  return PostAsset;
};
