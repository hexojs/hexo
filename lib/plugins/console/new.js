var reservedKeys = ['_', 'title', 'layout', 'slug', 'path', 'replace'];

module.exports = function(args, callback){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    hexo.call('help', {_: ['new']}, callback);
    return;
  }

  var data = {
    title: args._.pop(),
    layout: args._.length ? args._[0] : hexo.config.default_layout,
    slug: args.s || args.slug,
    path: args.p || args.path
  };

  var keys = Object.keys(args);

  for (var i = 0, len = keys.length; i < len; i++){
    var key = keys[i];
    if (~reservedKeys.indexOf(key)) continue;

    data[key] = args[key];
  }
  
  hexo.post.create(data, args.r || args.replace, function(err, target){
    if (err) return callback(err);

    hexo.log.i('File created at %s', target);
    callback();
  });
};