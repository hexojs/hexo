var url = require('url'),
  util = require('../../util'),
  escape = util.escape;

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

  var post,
    postPath;

  if (doc){
    post = Post.get(doc.post_id);
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
    var posts = Post.toArray();

    for (var i = 0, len = posts.length; i < len; i++){
      post = posts[i];

      if (new RegExp('^' + escape.regex(post.asset_dir)).test(data.source)){
        break;
      }
    }

    if (!post) return callback();

    postPath = post.path;

    Asset.insert({
      _id: source,
      path: url.resolve(postPath, data.source.substring(post.asset_dir.length)),
      modified: true,
      post_path: postPath,
      post_id: post._id
    }, function(){
      callback();
    });
  }
};