var _ = require('lodash'),
  async = require('async');

/**
* Loads post files.
*
* This function does:
*
* - {% crosslink theme/process %}: Processes theme files
* - {% crosslink theme/watch %}: Watches theme files (When `options.watch` is true)
* - {% crosslink source/process %}: Processes source files
* - {% crosslink source/watch %}: Watches source files (When `options.watch` is true)
* - {% crosslink theme/generate %}: Runs generators
*
* @method load
* @param {Object} [options]
*   @param {Boolean} [options.watch=false] Watch source files
* @param {Function} [callback]
* @for post
* @static
*/

module.exports = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    watch: false
  }, options);

  var isReady = false;

  async.auto({
    process_theme: function(next){
      hexo.theme.process(next);
    },
    watch_theme: ['process_theme', function(next){
      if (options.watch){
        hexo.theme.watch();

        hexo.on('processAfter', function(path){
          if (isReady && path === hexo.theme_dir){
            hexo.theme.generate(options);
          }
        });
      }

      next();
    }],
    process_source: function(next){
      hexo.source.process(next);
    },
    watch_source: ['process_source', function(next){
      if (options.watch){
        hexo.source.watch();

        hexo.on('processAfter', function(path){
          if (isReady && path === hexo.source_dir){
            hexo.theme.generate(options);
          }
        });
      }

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