var Database = require('warehouse'),
  fs = require('graceful-fs'),
  path = require('path'),
  async = require('async'),
  Model = require('../model');

module.exports = function(callback){
  var db = new Database(),
    dbPath = path.join(hexo.base_dir, 'db.json');

  /**
  * The model instance.
  *
  * @property model
  * @type Model
  * @for Hexo
  */

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
      var schema = require('../model/schema');

      model.register('Asset', schema.Asset);
      model.register('Cache', schema.Cache);
      model.register('Category', schema.Category, require('../model/category'));
      model.register('Page', schema.Page);
      model.register('Post', schema.Post, require('../model/post'));
      model.register('Tag', schema.Tag, require('../model/tag'));

      hexo.locals({
        posts: function(){
          return model('Post').populate('categories').populate('tags');
        },
        pages: function(){
          return model('Page');
        },
        categories: function(){
          return model('Category');
        },
        tags: function(){
          return model('Tag');
        }
      });

      next();
    }
  ], callback);
};