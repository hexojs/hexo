var extend = require('../../extend'),
  config = hexo.config,
  log = hexo.log;

extend.console.register('new', 'Create a new article', {alias: 'n'}, function(args, callback){
  if (!args._.length) return console.log('Usage: hexo new [layout] <title>');

  require('../../create')({
    title: args._.pop(),
    layout: args._.length ? args._[0] : config.default_layout
  }, function(err, target){
    if (err) return log.e(err);

    log.i('File created at ' + target);
  });
});
