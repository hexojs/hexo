exports.removeFromPost = function(data, next){
  var model = hexo.model,
    Post = model('Post');

  data.posts.forEach(function(post){
    Post.updateById(post, {categories: {$pull: data._id}});
  });
};