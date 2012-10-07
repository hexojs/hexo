var paginator = require('./paginator'),
  extend = require('../extend');

extend.generator.register(function(locals, render, callback){
  var config = hexo.config;
  paginator('', locals.posts, 'index', render, callback);
});