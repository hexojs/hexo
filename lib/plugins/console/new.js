module.exports = function(args, callback){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    hexo.call('help', {_: ['new']}, callback);
    return;
  }

  hexo.post.create({
    title: args._.pop(),
    layout: args._.length ? args._[0] : hexo.config.default_layout,
    slug: args.s || args.slug
  }, args.r || args.replace, function(err, target){
    if (err) return callback(err);

    hexo.log.i('File created at ' + target);
    callback();
  });
};