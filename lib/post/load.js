var _ = require('lodash'),
  async = require('async');

module.exports = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var options = _.extend({
    watch: false
  }, options);

  var isReady = false;

  async.auto({
    load_theme: function(next){
      hexo.theme.load(next);
    },
    watch_theme: ['load_theme', function(next){
      if (options.watch) hexo.theme.watch();

      next();
    }],
    load_source: function(next){
      hexo.source.load(next);
    },
    watch_source: ['load_source', function(next){
      if (options.watch) hexo.source.watch(function(){
        if (isReady) hexo.theme.generate(options);
      });

      next();
    }]
  }, function(err){
    if (err) return callback(err);

    hexo.theme.generate(options, function(err){
      if (err) return callback(err);

      isReady = true;
      callback();
    });
  });
};