var Post = hexo.model('Post');

exports.index = function(req, res, next){
  res.render('posts/index', {
    posts: Post.sort({date: -1})
  });
};

exports.new = function(req, res, next){
  res.render('posts/new');
};

exports.create = function(req, res, next){
  //
};

exports.edit = function(req, res, next){
  res.render('posts/edit');
};

exports.update = function(req, res, next){
  //
};

exports.destroy = function(req, res, next){
  //
};