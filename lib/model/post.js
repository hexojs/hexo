var _ = require('lodash'),
  async = require('async'),
  model = hexo.model;

model.extend('Post', {
  save: function(data, callback){
    var Category = model('Category'),
      Tag = model('Tag'),
      self = this;

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

    async.waterfall([
      function(next){
        if (data._id){
          var _id = data._id,
            oldData = self.get(_id);

          oldData.categories.forEach(function(cat){
            Category.pull(cat._id, _id);
          });

          oldData.tags.forEach(function(tag){
            Tag.pull(tag._id, _id);
          });

          self.replace(_id, data);
          next(null, data._id)
        } else {
          self.insert(data, function(data, id){
            next(null, id);
          });
        }
      },
      function(id, next){
        cats.forEach(function(cat){
          Category.push(cat, id);
        });

        tags.forEach(function(tag){
          Tag.push(tag, id);
        });

        callback();
      }
    ]);
  },
  del: function(id){
    var Category = model('Category'),
      Tag = model('Tag'),
      data = this.get(id);

    data.categories.forEach(function(cat){
      Category.pull(cat._id, data._id);
    });

    data.tags.forEach(function(tag){
      Tag.pull(tag._id, data._id);
    });

    this.remove(id);
  }
});

model.posts = model('Post');