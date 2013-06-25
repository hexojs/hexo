var _ = require('lodash'),
  fs = require('graceful-fs'),
  Post = hexo.model('Post'),
  create = hexo.create,
  process = hexo.process,
  sourceDir = hexo.source_dir;

exports.index = function(req, res, next){
  var query = _.defaults(req.query, {
    page: 1,
    limit: 20
  });

  var posts = Post.sort('date', -1),
    arr = [];

  /*if (query.limit > 0){
    posts = posts.skip(query.limit * (query.page - 1)).limit(query.limit);
  }*/

  posts.forEach(function(post){
    arr.push({
      id: post._id,
      title: post.title,
      date: post.date.valueOf()
    });
  });

  res.json(arr);
};

exports.create = function(req, res, next){
  create({title: req.body.title, layout: 'post'}, function(err, target){
    if (err) return next(err);

    var path = target.substring(sourceDir.length);

    process(path, function(err){
      if (err) return next(err);

      var post = Post.findOne({source: path});

      if (!post) return res.send(500);

      post.date = post.date.valueOf();
      post.updated = post.updated.valueOf();
      post.ctime = post.ctime.valueOf();
      post.mtime = post.mtime.valueOf();

      res.json(post);
    });
  });
};

exports.show = function(req, res, next){
  var post = Post.get(req.params.id);

  if (!post) return res.send(404);

  res.json({
    id: post._id,
    title: post.title,
    date: post.date,
    content: post.original_content
  });
};

exports.update = function(req, res, next){
  var id = req.params.id,
    data = Post.get(id);

  if (!data) return res.send(404);

  fs.writeFile(data.full_path, req.body.content, function(err){
    if (err) return next(err);

    process(data.source, function(err){
      if (err) return next(err);

      var post = Post.get(id);

      if (!post) return res.send(500);

      post.date = post.date.valueOf();
      post.updated = post.updated.valueOf();
      post.ctime = post.ctime.valueOf();
      post.mtime = post.mtime.valueOf();

      res.json(post);
    });
  });
};

exports.destroy = function(req, res, next){
  var post = Post.get(req.params.id);

  if (!post) return res.send(404);

  fs.unlink(post.full_path, function(err){
    if (err) return next(err);

    Post.remove(post._id);
    res.json({success: 1});
  });
};