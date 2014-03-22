var async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  pathFn = require('path'),
  util = require('../../util'),
  file = util.file2,
  HexoError = require('../../error');

module.exports = function(args, callback){
  var watchOption = args.w || args.watch,
    start = Date.now(),
    cache = {},
    isLoaded = false;

  var counter = {
    create: 0,
    update: 0,
    skip: 0
  };

  var log = hexo.log,
    config = hexo.config,
    route = hexo.route,
    publicDir = hexo.public_dir,
    sourceDir = hexo.source_dir;

  var cleanPublic = function(callback){
    fs.exists(publicDir, function(exist){
      if (!exist) return callback();

      var exclude = _.map(Object.keys(route.routes), function(i){
        return pathFn.normalize(i);
      });

      file.emptyDir(publicDir, {exclude: exclude}, function(err){
        if (err) return callback(HexoError.wrap(err, 'Public folder clear failed'));

        log.d('Public folder cleared.');
        callback();
      });
    });
  };

  var emit = function(type, path){
    counter[type]++;
    log.log(type, 'Public: %s', path);

    if (isLoaded && Object.keys(route.routes).length === counter.create + counter.update + counter.skip){
      var elapsed = (Date.now() - start) / 1000;

      /**
      * Fired after generation done.
      *
      * @event generateAfter
      * @for Hexo
      */

      hexo.emit('generateAfter');
      log.i('%d files generated in %ss', counter.create, elapsed.toFixed(3));

      if (watchOption){
        log.i('Start watching. Press Ctrl+C to stop.');
      } else {
        if (args.d || args.deploy){
          hexo.call('deploy', callback);
        } else {
          callback();
        }
      }
    }
  };

  var itemCallback = function(err){
    if (err){
      throw HexoError.wrap(err, 'File generate failed: ' + this.path);
    }

    emit(this.type, this.path);
  };

  route.on('update', function(path, item){
    if (!item.modified){
      emit('skip', path);
      return;
    }

    item(function(err, result){
      if (err) throw HexoError.wrap(err, 'File render failed: ' + path);
      if (typeof result === 'undefined') return;

      var dest = pathFn.join(publicDir, path);

      if (result.readable){
        file.copyFile(result.path, dest, itemCallback.bind({
          path: path,
          type: 'create'
        }));
      } else {
        if (cache[path] === result){
          emit('skip', path);
        } else {
          file.writeFile(dest, result, itemCallback.bind({
            path: path,
            type: cache[path] ? 'update' : 'create'
          }));

          cache[path] = result;
        }
      }
    });
  }).on('remove', function(path){
    fs.unlink(pathFn.join(publicDir, path), function(){
      log.log('delete', 'Public: %s', path);
      cleanPublic();
    });
  });

  /**
  * Fired before generation started.
  *
  * @event generateBefore
  * @for Hexo
  */

  hexo.emit('generateBefore');

  hexo.post.load({watch: watchOption}, function(err){
    if (err) return callback(err);

    var elapsed = (Date.now() - start) / 1000;

    isLoaded = true;
    start = Date.now();

    log.i('Files loaded in %ss', elapsed.toFixed(3));

    cleanPublic(function(err){
      if (err) return callback(err);
    });
  });
};