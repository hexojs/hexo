'use strict';

const { Schema } = require('warehouse');
const { slugize } = require('hexo-util');
const full_url_for = require('../plugins/helper/full_url_for');

module.exports = ctx => {
  const Category = new Schema({
    name: {type: String, required: true},
    parent: {type: Schema.Types.CUID, ref: 'Category'}
  });

  Category.virtual('slug').get(function() {
    let name = this.name;

    if (!name) return;

    let str = '';

    if (this.parent) {
      const parent = ctx.model('Category').findById(this.parent);
      str += `${parent.slug}/`;
    }

    const map = ctx.config.category_map || {};

    name = map[name] || name;
    str += slugize(name, {transform: ctx.config.filename_case});

    return str;
  });

  Category.virtual('path').get(function() {
    let catDir = ctx.config.category_dir;
    if (catDir === '/') catDir = '';
    if (catDir.length && catDir[catDir.length - 1] !== '/') catDir += '/';

    return `${catDir + this.slug}/`;
  });

  Category.virtual('permalink').get(function() {
    const { config } = ctx;
    const indexPattern = /index\.html$/;
    let url = full_url_for.call(ctx, this.path);
    if (config.pretty_urls.trailing_index === false) url = url.replace(indexPattern, '');
    if (config.pretty_urls.trailing_html === false && !indexPattern.test(url)) {
      url = url.replace(/\.html$/, '/');
    }
    return url;
  });

  Category.virtual('posts').get(function() {
    const PostCategory = ctx.model('PostCategory');

    const ids = PostCategory.find({category_id: this._id}).map(item => item.post_id);

    return ctx.locals.get('posts').find({
      _id: {$in: ids}
    });
  });

  Category.virtual('length').get(function() {
    return this.posts.length;
  });

  // Check whether a category exists
  Category.pre('save', data => {
    const { name, parent } = data;
    if (!name) return;

    const Category = ctx.model('Category');
    const cat = Category.findOne({
      name,
      parent: parent || {$exists: false}
    }, {lean: true});

    if (cat) {
      throw new Error(`Category \`${name}\` has already existed!`);
    }
  });

  // Remove PostCategory references
  Category.pre('remove', data => {
    const PostCategory = ctx.model('PostCategory');
    return PostCategory.remove({category_id: data._id});
  });

  return Category;
};
