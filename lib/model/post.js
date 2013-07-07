var _ = require('lodash'),
  model = hexo.model;

model.extend('Post', {
  save: function(data){
    var Category = model('Category'),
      Tag = model('Tag');

    var cats = [],
      tags = [];

    if (data.categories){
      Category.create(data.categories, function(result){
        cats = _.map(result, function(item){
          return item._id;
        });
      });
    }

    if (data.tags){
      data.tags.forEach(function(tag){
        Tag.create(tag, function(result){
          tags.push(result._id);
        });
      });
    }

    data.categories = cats;
    data.tags = tags;

    if (data._id){
      this.update(data._id, data);
    } else {
      this.insert(data);
    }
  },
  del: function(id){
    var Category = model('Category'),
      Tag = model('Tag'),
      data = this.get(id);

    data.categories.forEach(function(cat){
      Category.pull(data._id, cat._id);
    });

    data.tags.forEach(function(tag){
      Tag.pull(data._id, tag._id);
    });

    this.remove(id);
  }
});

model.posts = model('Post');