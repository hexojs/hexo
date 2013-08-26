var store = {
  route: require('./route')
};

module.exports = function(args, callback){
  var type = args._[0];

  // Display help message if user didn't input any arguments
  if (!type || !store.hasOwnProperty(type)){
    hexo.call('help', {_: ['list']}, callback);
    return;
  }

  hexo.post.load(function(err){
    if (err) return callback(err);

    store[type](args, callback);
  });
};