var Database = require('warehouse'),
  fs = require('graceful-fs'),
  path = require('path'),
  async = require('async'),
  Model = require('../model');

module.exports = function(callback){
  var db = new Database(),
    dbPath = path.join(hexo.base_dir, 'db.json');

  var model = hexo.model = new Model(db);

  async.series([
    function(next){
      fs.exists(dbPath, function(exist){
        if (!exist) return next();

        hexo.log.d('Loading database.');

        db.load(dbPath, function(err){
          if (!err) return next();

          hexo.log.e('Database load failed. Deleting database.');
          fs.unlink(dbPath, next);
        });
      });
    },
    function(next){
      model.register('Asset', require('../model/asset'));
      model.register('Cache', require('../model/cache'));
      model.register('Category', require('../model/category'));
      model.register('Page');
      model.register('Post', require('../model/post'));
      model.register('PostAsset', require('../model/post_asset'));
      model.register('Tag', require('../model/tag'));
      model.register('Token');

      next();
    }
  ], callback);
};