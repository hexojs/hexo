var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  _ = require('lodash'),
  util = require('../../util'),
  file = util.file2;

var renderFn = hexo.render,
  render = renderFn.render,
  isRenderable = renderFn.isRenderable,
  getOutput = renderFn.getOutput;

var baseDir = hexo.base_dir;

module.exports = function(args, callback){
  // Display help message if user didn't input any arguments
  if (!args._.length){
    hexo.call('help', {_: ['render']}, callback);
    return;
  }

  var outputDir = args.o || args.output || baseDir;

  var renderItem = function(path, callback){
    if (!isRenderable(path)) return callback();

    render({path: path}, args, function(err, result){
      if (err) return callback(err);

      if (result.toString){
        result = result.toString();
      } else if (_.isObject(result)){
        result = JSON.stringify(result);
      }

      var extname = pathFn.extname(path),
        dest = pathFn.join(outputDir, path.substring(0, path.length - extname.length + 1) + getOutput(path));

      file.writeFile(dest, result, callback);
    });
  };

  async.forEach(args._, function(item, next){
    fs.stat(item, function(stats){
      if (err) return callback(err);

      if (stats.isDirectory()){
        file.list(item, function(files){
          async.forEach(files, function(item, next){
            renderItem(pathFn.join(item, i), next);
          }, next);
        });
      } else {
        renderItem(item, next);
      }
    });
  }, callback);
};