var paginator = require('./paginator'),
  extend = require('../extend');

extend.generate.register(function(locals, render, callback){
  var config = hexo.config;
  paginator('', locals.posts, 'index', render, function(){
    console.log('Index generated.');
    callback();
  });
});