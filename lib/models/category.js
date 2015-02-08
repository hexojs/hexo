'use strict';

var Schema = require('warehouse').Schema;
var util = require('hexo-util');
var slugize = util.slugize;

module.exports = function(ctx){
  var Category = new Schema({
    name: {type: String, required: true},
    parent: {type: Schema.Types.CUID, ref: 'Category'}
  });

  Category.virtual('slug').get(function(){
    var map = ctx.config.category_map || {};
    var name = this.name;
    var str = '';

    if (!name) return;

    if (this.parent){
      var parent = ctx.model('Category').findById(this.parent);
      str += parent.slug + '/';
    }

    name = map[name] || name;
    str += slugize(name, {transform: ctx.config.filename_case});

    return str;
  });

  Category.virtual('path').get(function(){
    var catDir = ctx.config.category_dir;
    if (catDir[catDir.length - 1] !== '/') catDir += '/';

    return catDir + this.slug + '/';
  });

  Category.virtual('permalink').get(function(){
    return ctx.config.url + '/' + this.path;
  });

  Category.virtual('posts').get(function(){
    var PostCategory = ctx.model('PostCategory');

    var ids = PostCategory.find({category_id: this._id}).map(function(item){
      return item.post_id;
    });

    return ctx.locals.get('posts').find({
      _id: {$in: ids}
    });
  });

  Category.virtual('length').get(function(){
    return this.posts.length;
  });

  // Check whether a category exists
  Category.pre('save', function(data){
    var name = data.name;
    var parent = data.parent;
    if (!name) return;

    var Category = ctx.model('Category');
    var cat = Category.findOne({
      name: name,
      parent: parent || {$exists: false}
    });

    if (cat && cat._id === data._id){
      throw new Error('Category `' + name + '` has already existed!');
    }
  });

  // Remove PostCategory references
  Category.pre('remove', function(data){
    var PostCategory = ctx.model('PostCategory');
    return PostCategory.remove({category_id: data._id});
  });

  return Category;
};