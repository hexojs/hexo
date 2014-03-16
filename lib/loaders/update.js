var path = require('path'),
  async = require('async'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2,
  HexoError = require('../error');

module.exports = function(callback){
  if (!hexo.env.init) return callback();

  var packagePath = path.join(hexo.base_dir, 'package.json');

  async.waterfall([
    // Check package.json existance
    function(next){
      fs.exists(packagePath, function(exist){
        next(null, exist);
      });
    },
    // Update package.json version
    function(exist, next){
      var obj = {};

      if (exist){
        obj = require(packagePath);

        if (hexo.version === obj.version) return next(null, false);

        hexo.log.d('Updating package.json version');
        obj.version = hexo.version;
      } else {
        obj = {
          name: 'hexo-site',
          version: version,
          private: true,
          dependencies: {}
        };

        hexo.log.d('package.json lost. Rebuilding a new one.');
      }

      file.writeFile(packagePath, JSON.stringify(obj, null, '  '), function(err){
        next(err, exist);
      });
    },
    // Delete old db.json
    function(old, next){
      if (!old) return next();

      var dbPath = path.join(hexo.base_dir, 'db.json');

      hexo.log.d('Hexo was just updated. Deleting old cache database.');

      fs.exists(dbPath, function(exist){
        if (!exist) return next();

        fs.unlink(dbPath, next);
      });
    }
  ], function(err){
    if (err) return hexo.log.e(HexoError.wrap(err, 'Version info check failed'));

    hexo.log.d('Version info checked successfully');
    callback();
  });
};