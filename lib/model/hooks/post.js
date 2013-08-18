exports.createCategory = function(data, next){
  var categories = data.categories;

  if (!categories || !categories.length) return next();

  var model = hexo.model,
    Category = model('Category');

  categories.forEach(function(name, i){
    var doc = Category.get(name);

    if (!doc){
      var query = {
        name: name,
        parent: i == 0 ? {$exist: false} : categories[i - 1]
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