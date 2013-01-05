var paginator = require('./paginator'),
  extend = require('../extend');

extend.generator.register(function(locals, render, callback){
  paginator('', locals.posts, 'index', render, callback);
});