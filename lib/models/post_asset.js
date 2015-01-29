'use strict';

var Schema = require('warehouse').Schema;
var pathFn = require('path');
var url = require('url');

module.exports = function(ctx){
  var PostAsset = new Schema({
    _id: {type: String, required: true},
    slug: {type: String, required: true},
    modified: {type: Boolean, default: true},
    post: {type: Schema.Types.CUID, ref: 'Post'}
  });

  PostAsset.virtual('path').get(function(){
    var Post = ctx.model('Post');
    var post = Post.findById(this.post);
    if (!post) return;

    return url.resolve(post.path, this.slug);
  });

  PostAsset.virtual('source').get(function(){
    return pathFn.join(ctx.base_dir, this._id);
  });

  return PostAsset;
};