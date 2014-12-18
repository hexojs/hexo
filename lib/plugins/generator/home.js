var paginator = require('./paginator');

module.exports = function(locals, render){
  var posts = locals.posts.sort('-date');
  paginator.call(this, '', posts, 'index', render);
};