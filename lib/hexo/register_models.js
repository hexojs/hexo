var models = require('../models');

module.exports = function(ctx){
  var db = ctx.database;

  db.model('Asset', models.Asset(ctx));
  db.model('Cache', models.Cache(ctx));
  db.model('Category', models.Category(ctx));
  db.model('Page', models.Page(ctx));
  db.model('Post', models.Post(ctx));
  db.model('PostCategory', models.PostCategory(ctx));
  db.model('PostTag', models.PostTag(ctx));
  db.model('Tag', models.Tag(ctx));
};