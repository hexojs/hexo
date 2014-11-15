var Promise = require('bluebird');
var pathFn = require('path');
var tildify = require('tildify');
var prettyHrtime = require('pretty-hrtime');
var util = require('../../util');
var fs = util.fs;

require('colors');

module.exports = function(ctx){
  var render = ctx.render;
  var baseDir = hexo.base_dir;

  return function(args){
    var files = args._;
    var output = args.o || args.output;
    var engine = args.engine;

    return Promise.map(files, function(path){
      var src = pathFn.resolve(baseDir, path);
      // var start = Date.now();
      var start = process.hrtime();

      return render.render({
        path: src,
        engine: engine
      }).then(function(result){
        if (typeof result === 'object'){
          if (args.pretty){
            result = JSON.stringify(result, null, '  ');
          } else {
            result = JSON.stringify(result);
          }
        }

        if (!output) return console.log(result);

        var extname = pathFn.extname(path);
        var dest = pathFn.resolve(output, path.substring(0, path.length - extname.length + 1)) + render.getOutput(path);
        var interval = prettyHrtime(process.hrtime(start));

        log.info('Rendered in %s: %s -> %s', interval.cyan, tildify(src).magenta, tildify(dest).magenta);
        return fs.writeFile(dest, result);
      });
    });
  };
};