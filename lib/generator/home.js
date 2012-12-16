var paginator = require('./paginator'),
  extend = require('../extend'),
  _ = require('underscore');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config;
  paginator('', _.clone(locals.posts), 'index', render, callback);
});