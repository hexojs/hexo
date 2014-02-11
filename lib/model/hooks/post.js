var _ = require('lodash');

exports.createCategory = function(data, next){
  var categories = data.categories;

  if (!categories || !categories.length) return next();

  var model = hexo.model,
    Category = model('Category'),
    i = 0;

  categories.forEach(function(name, i){
    var doc = Category.get(name);

    if (!doc){
      var query = {
        name: name,
        parent: i === 0 ? {$exist: false} : categories[i - 1]
      };

      doc = Category.findOne(query);
    }

    if (doc){
      categories[i] = doc._id;
    } else {
      var data = {
        name: name
      };

      if (i > 0){
        data.parent = categories[i - 1];
      }

      Category.insert(data, function(category){
        categories[i] = category._id;
      });
    }
  });

  next();
};

exports.createTag = function(data, next){
  var tags = data.tags;

  if (!tags || !tags.length) return next();

  var model = hexo.model,
    Tag = model('Tag');

  tags.forEach(function(name, i){
    var doc = Tag.get(name) || Tag.findOne({name: name});

    if (doc){
      tags[i] = doc._id;
    } else {
      Tag.insert({name: name}, function(tag){
        tags[i] = tag._id;
      });
    }
  });

  next();
};

exports.updateCategory = function(data, next){
  if (!data._id) return next();

  var model = hexo.model,
    Post = model('Post');
    Category = model('Category');

  var doc = Post.get(data._id);
  if (!doc) return next();

  var arr = _.difference(doc.categories, data.categories);

  if (!arr.length) return next();

  arr.forEach(function(category){
    Category.updateById(category, {posts: {$pull: data._id}});
  });

  next();
};

exports.updateTag = function(data, next){
  if (!data._id) return next();

  var model = hexo.model,
    Post = model('Post');
    Tag = model('Tag');

  var doc = Post.get(data._id);
  if (!doc) return next();

  var arr = _.difference(doc.tags, data.tags);

  if (!arr.length) return next();

  arr.forEach(function(tag){
    Tag.updateById(tag, {posts: {$pull: data._id}});
  });

  next();
};

exports.addToCategory = function(data){
  var model = hexo.model,
    Category = model('Category');

  data.categories.forEach(function(category){
    Category.updateById(category, {posts: {$addToSet: data._id}});
  });
};

exports.addToTag = function(data){
  var model = hexo.model,
    Tag = model('Tag');

  data.tags.forEach(function(tag){
    Tag.updateById(tag, {posts: {$addToSet: data._id}});
  });
};

exports.removeFromCategory = function(data, next){
  var model = hexo.model,
    Category = model('Category');

  data.categories.forEach(function(category){
    Category.updateById(category, {posts: {$pull: data._id}});
  });

  next();
};

exports.removeFromTag = function(data, next){
  var model = hexo.model,
    Tag = model('Tag');

  data.tags.forEach(function(tag){
    Tag.updateById(tag, {posts: {$pull: data._id}});
  });

  next();
};

exports.removeAssets = function(data, next){
  var Asset = hexo.model('Asset'),
    route = hexo.route;

  Asset.find({post: data._id}).each(function(asset){
    route.remove(asset.path);
  }).remove();

  next();
};