'use strict';

const { Schema } = require('warehouse');
const { join } = require('path');
const Moment = require('./types/moment');
const moment = require('moment');
const { full_url_for } = require('hexo-util');

module.exports = ctx => {
  const Page = new Schema({
    id: String,
    title: {type: String, default: ''},
    date: {
      type: Moment,
      default: moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    updated: {
      type: Moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'page'},
    _content: {type: String, default: ''},
    source: {type: String, required: true},
    path: {type: String, required: true},
    raw: {type: String, default: ''},
    content: {type: String},
    excerpt: {type: String},
    more: {type: String}
  });

  Page.virtual('permalink').get(function() {
    return full_url_for.call(ctx, this.path);
  });

  Page.virtual('full_source').get(function() {
    return join(ctx.source_dir, this.source || '');
  });

  return Page;
};

  Page.virtual('tags').get(function() {
    const PageTag = ctx.model('PageTag');
    const Tag = ctx.model('Tag');

    const ids = PageTag.find({page_id: this._id}, {lean: true}).map(item => item.tag_id);

    return Tag.find({_id: {$in: ids}});
  });

  Page.method('setTags', function(tags) {
    tags = removeEmptyTag(tags);

    const PageTag = ctx.model('PageTag');
    const Tag = ctx.model('Tag');
    const id = this._id;
    const existed = PageTag.find({page_id: id}, {lean: true}).map(pickID);

    return Promise.map(tags, tag => {
      // Find the tag by name
      const data = Tag.findOne({name: tag}, {lean: true});
      if (data) return data;

      // Insert the tag if not exist
      return Tag.insert({name: tag}).catch(err => {
        // Try to find the tag again. Throw the error if not found
        const data = Tag.findOne({name: tag}, {lean: true});

        if (data) return data;
        throw err;
      });
    }).map(tag => {
      // Find the reference
      const ref = PageTag.findOne({page_id: id, tag_id: tag._id}, {lean: true});
      if (ref) return ref;

      // Insert the reference if not exist
      return PageTag.insert({
        page_id: id,
        tag_id: tag._id
      });
    }).then(tags => {
      // Remove old tags
      const deleted = existed.filter(item => !tags.map(pickID).includes(item));
      return deleted;
    }).map(tag => PageTag.removeById(tag));
  });

  Page.virtual('categories').get(function() {
    const PageCategory = ctx.model('PageCategory');
    const Category = ctx.model('Category');

    const ids = PageCategory.find({page_id: this._id}, {lean: true}).map(item => item.category_id);

    return Category.find({_id: {$in: ids}});
  });

  Page.method('setCategories', function(cats) {
    // Remove empty categories, preserving hierarchies
    cats = cats.filter(cat => {
      return Array.isArray(cat) || (cat != null && cat !== '');
    }).map(cat => {
      return Array.isArray(cat) ? removeEmptyTag(cat) : `${cat}`;
    });

    const PageCategory = ctx.model('PageCategory');
    const Category = ctx.model('Category');
    const id = this._id;
    const allIds = [];
    const existed = PageCategory.find({page_id: id}, {lean: true}).map(pickID);
    const hasHierarchy = cats.filter(Array.isArray).length > 0;

    // Add a hierarchy of categories
    const addHierarchy = catHierarchy => {
      const parentIds = [];
      if (!Array.isArray(catHierarchy)) catHierarchy = [catHierarchy];
      // Don't use "Promise.map". It doesn't run in series.
      // MUST USE "Promise.each".
      return Promise.each(catHierarchy, (cat, i) => {
        // Find the category by name
        const data = Category.findOne({
          name: cat,
          parent: i ? parentIds[i - 1] : {$exists: false}
        }, {lean: true});

        if (data) {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        }

        // Insert the category if not exist
        const obj = {name: cat};
        if (i) obj.parent = parentIds[i - 1];

        return Category.insert(obj).catch(err => {
          // Try to find the category again. Throw the error if not found
          const data = Category.findOne({
            name: cat,
            parent: i ? parentIds[i - 1] : {$exists: false}
          }, {lean: true});

          if (data) return data;
          throw err;
        }).then(data => {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        });
      });
    };

    return (hasHierarchy ? Promise.each(cats, addHierarchy) : Promise.resolve(addHierarchy(cats))
    ).then(() => allIds).map(catId => {
      // Find the reference
      const ref = PageCategory.findOne({page_id: id, category_id: catId}, {lean: true});
      if (ref) return ref;

      // Insert the reference if not exist
      return PageCategory.insert({
        page_id: id,
        category_id: catId
      });
    }).then(pageCats => // Remove old categories
      existed.filter(item => !pageCats.map(pickID).includes(item))).map(cat => PageCategory.removeById(cat));
  });

  // Remove PageTag references
  Page.pre('remove', data => {
    const PageTag = ctx.model('PageTag');
    return PageTag.remove({page_id: data._id});
  });

  // Remove PageCategory references
  Page.pre('remove', data => {
    const PageCategory = ctx.model('PageCategory');
    return PageCategory.remove({page_id: data._id});
  });
