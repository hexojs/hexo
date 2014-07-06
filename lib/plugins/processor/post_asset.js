var url = require('url');

module.exports = function(data, callback){
  var path = data.params.path,
    source = data.source.substring(hexo.base_dir.length);

  var Asset = hexo.model('Asset'),
    Post = hexo.model('Post'),
    doc = Asset.get(source);

  if (data.type === 'skip' && doc){
    return callback();
  }

  if (data.type === 'delete'){
    if (doc){
      hexo.route.remove(doc.path);
      doc.remove();
    }

    return callback();
  }

  if (doc){
    var post = Post.get(doc.post_id),
      postPath = post.path;

    if (post){
      doc.update({
        path: url.resolve(postPath, data.source.substring(post.asset_dir.length)),
        modified: data.type === 'update',
        post_path: postPath
      }, function(){
        callback();
      });
    } else {
      doc.remove(function(){
        callback();
      });
    }
  } else {
    // TODO: Users can't see new assets unless post updated. Try to find the post path from post_asset processor.
    callback();
  }
};