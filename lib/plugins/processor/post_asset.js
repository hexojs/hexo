var url = require('url');

module.exports = function(data, callback){
  var path = data.params.path;

  var Asset = hexo.model('Asset'),
    Post = hexo.model('Post'),
    doc = Asset.get(data.path);

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
    var post = Post.get(asset.post_id);

    if (post){
      doc.path = url.resolve(post.path, data.source.substring(post.asset_dir.length));
      doc.modified = data.type === 'update';

      doc.update(function(){
        callback();
      });
    } else {
      doc.remove(function(){
        callback();
      });
    }
  } else {
    callback();
  }
};