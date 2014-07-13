var paginator = require('./paginator');

module.exports = function(locals, render, callback){
  var posts = locals.posts.sort('date', -1);
  paginator('', posts, 'index', render);
  callback();
};