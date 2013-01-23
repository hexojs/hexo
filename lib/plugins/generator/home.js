var paginator = require('./paginator'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  paginator('', locals.posts.find({title: /.*/}).sort('date', -1), 'index', render);
  callback();
});