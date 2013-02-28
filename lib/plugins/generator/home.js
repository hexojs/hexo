var paginator = require('./paginator'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  var posts = locals.posts.sort('date', -1);
  paginator('', posts, 'index', render);
  callback();
});