var extend = require('../../extend'),
  renderFn = require('../../render'),
  render = renderFn.render,
  isRenderable = renderFn.isRenderable,
  getOutput = renderFn.getOutput,
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  async = require('async');

extend.console.register('render', 'Render file', {init: true}, function(args, callback){
  var baseDir = hexo.base_dir,
    outputDir = args.o || args.output || baseDir;

  if (!args._.length){
    console.log('No input files.');
    return callback();
  }

  var resolve = function(path){
    return pathFn.resolve(outputDir, path);
  };

  var getItemPath = function(path){
    var extname = pathFn.extname(path);
    return resolve(path.substring(0, path.length - extname.length + 1) + getOutput(extname));
  };

  var renderItem = function(path, callback){
    if (!isRenderable(path)) return callback();

    render({path: path}, args, function(err, result){
      if (err) throw err;
      if (!result) return callback();

      if (_.isObject(result)) result = JSON.stringify(result, null, '  ');

      fs.writeFile(getItemPath(path), result, callback);
    });
  };

  async.forEach(args._, function(item, next){
    item = item.toString();

    async.waterfall([
      function(cb){
        fs.exists(item, function(exist){
          if (!exist) return next();
          cb();
        });
      },
      function(cb){
        fs.stat(item, function(err, stats){
          if (err) throw err;

          cb(null, stats.isDirectory());
        });
      },
      function(isDirectory, cb){
        if (isDirectory){
          //
        } else {
          renderItem(item, next);
        }
      }
    ]);
  }, function(){
    console.log('Render complete.');
    callback();
  });
});