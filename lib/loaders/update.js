var pathFn = require('path'),
  async = require('async'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2,
  HexoError = require('../error');

module.exports = function(callback){
  if (!hexo.env.init) return callback();

  var packagePath = pathFn.join(hexo.base_dir, 'package.json'),
    log = hexo.log;

  async.waterfall([
    // Check whether package.json exists or not
    function(next){
      fs.exists(packagePath, function(exist){
        if (exist) return next();

        log.d('Can\'t found package.json. Rebuilding a new one');
        file.copyFile(pathFn.join(hexo.core_dir, 'assets', 'package.json'), packagePath, next);
      });
    },
    // Update package.json
    function(next){
      var json = require(packagePath);
      if (json.version === hexo.version) return next(null, false);

      json.version = hexo.version;

      log.d('Updating package.json');

      file.writeFile(packagePath, JSON.stringify(json, null, '  '), function(err){
        next(err, true);
      });
    },
    // Remove db.json if outdated
    function(outdated, next){
      if (!outdated) return next();

      var dbPath = pathFn.join(hexo.base_dir, 'db.json');

      fs.exists(dbPath, function(exist){
        if (!exist) return next();

        log.d('Deleting old database');
        fs.unlink(dbPath, next);
      });
    }
  ], function(err){
    if (err) return hexo.log.e(HexoError.wrap(err, 'Version info check failed'));

    hexo.log.d('Version info checked successfully');
    callback();
  });
};