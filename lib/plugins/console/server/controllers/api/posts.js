var _ = require('lodash');

var Model = hexo.model,
  Post = Model('Post');

exports.index = function(req, res, next){
  var select = req.query.select ? req.query.select.split(',') : null,
    result = [];

  Post.each(function(post){
    if (select){
      result.push(_.extend({_id: post._id}, _.pick(post, select)));
    } else {
      result.push(post);
    }
  });

  return res.json(result);
};

exports.create = function(req, res, next){
  //
};

exports.show = function(req, res, next){
  var select = req.query.select ? req.query.select.split(',') : null,
    post = Post.get(req.params.id);

  if (post){
    if (select){
      res.json(_.extend({_id: post._id}, _.pick(post, select)));
    } else {
      res.json(post);
    }
  } else {
    res.send(404);
  }
};

exports.update = function(req, res, next){
  //
};

exports.destroy = function(req, res, next){
  //
};

exports.preview = function(req, res, next){
  //
};