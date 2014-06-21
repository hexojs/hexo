module.exports = function(args, callback){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    hexo.call('help', {_: ['publish']}, callback);
    return;
  }

  hexo.post.publish({
    slug: args._.pop(),
    layout: args._.length ? args._[0] : hexo.config.default_layout
  }, args.r || args.replace, function(err, target){
    if (err) return callback(err);

    hexo.log.i('Published %s', target);
    callback();
  });
};