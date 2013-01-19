var fs = require('graceful-fs'),
  pathFn = require('path'),
  swig = require('swig'),
  _ = require('underscore'),
  dbPosts = hexo.db.collection('posts'),
  dbPages = hexo.db.collection('pages'),
  extend = require('../../extend'),
  renderer = Object.keys(extend.renderer.list()),
  tagExt = extend.tag.list(),
  render = require('../../render'),
  route = require('../../route'),
  util = require('../../util'),
  yfm = util.yfm,
  titlecase = util.titlecase,
  highlight = util.highlight,
  config = hexo.config;

swig.init({tags: tag});

var load = function(source, content, callback){

};

extend.processor.register(/^_posts\/(.*)/, function(file, content, callback){

});

extend.processor.register(/^[^_]/, function(file, content, callback){

});

hexo.on('processAfter', function(){

});