var paginator = require('./paginator'),
  extend = require('../../extend');

extend.generator.register(function(locals, render, callback){
  var posts = locals.posts.sort('date', -1),
    arr = posts.toArray(),
    latest = true;

  for (var i=0, len=arr.length; i<len; i++){
    if (!arr[i]._latest){
      latest = false;
      break;
    }
  }

  if (!latest || hexo.cache.rebuild){
    paginator('', posts, 'index', render);
  }

  callback();
});