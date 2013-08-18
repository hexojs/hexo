var paginator = require('./paginator');

var config = hexo.config;

module.exports = function(locals, render, callback){
  if (config.exclude_generator && config.exclude_generator.indexOf('home') > -1) return callback();

  var posts = locals.posts.sort('date', -1).populate('categories').populate('tags');
  paginator('', posts, 'index', render);
  callback();
};