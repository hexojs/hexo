import warehouse from 'warehouse';
import moment from 'moment';
import { extname, join, sep } from 'path';
import Promise from 'bluebird';
import Moment from './types/moment';
import { full_url_for, Cache } from 'hexo-util';
import type Hexo from '../hexo';
import type { CategorySchema, PostCategorySchema, PostSchema } from '../types';

function pickID(data: PostSchema | PostCategorySchema) {
  return data._id;
}

function removeEmptyTag(tags: string[]) {
  return tags.filter(tag => tag != null && tag !== '').map(tag => `${tag}`);
}

const tagsGetterCache = new Cache();

export = (ctx: Hexo) => {
  const Post = new warehouse.Schema<PostSchema>({
    id: String,
    title: {type: String, default: ''},
    date: {
      type: Moment,
      default: moment
    },
    updated: {
      type: Moment
    },
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'post'},
    _content: {type: String, default: ''},
    source: {type: String, required: true},
    slug: {type: String, required: true},
    photos: [String],
    raw: {type: String, default: ''},
    published: {type: Boolean, default: true},
    content: {type: String},
    excerpt: {type: String},
    more: {type: String}
  });

  Post.virtual('path').get(function() {
    const path = ctx.execFilterSync('post_permalink', this, {context: ctx});
    return typeof path === 'string' ? path : '';
  });

  Post.virtual('permalink').get(function() {
    return full_url_for.call(ctx, this.path);
  });

  Post.virtual('full_source').get(function() {
    return join(ctx.source_dir, this.source || '');
  });

  Post.virtual('asset_dir').get(function() {
    const src = this.full_source;
    return src.substring(0, src.length - extname(src).length) + sep;
  });

  Post.virtual('tags').get(function() {
    return tagsGetterCache.apply(this._id, () => {
      const ReadOnlyPostTag = ctx._binaryRelationIndex.post_tag;
      const Tag = ctx.model('Tag');

      const ids = ReadOnlyPostTag.find({post_id: this._id}).map(item => item.tag_id);

      return Tag.find({_id: {$in: ids}});
    });
  });

  Post.method('notPublished', function() {
    // The same condition as ctx._bindLocals
    return (!ctx.config.future && this.date.valueOf() > Date.now()) || (!ctx._showDrafts() && this.published === false);
  });

  Post.method('setTags', function(tags: string[]) {
    if (this.notPublished()) {
      // Ignore tags of draft posts
      // If the post is unpublished then the tag needs to be removed, thus the function cannot be returned early here
      tags = [];
    }
    tagsGetterCache.flush();
    tags = removeEmptyTag(tags);

    const ReadOnlyPostTag = ctx._binaryRelationIndex.post_tag;
    const PostTag = ctx.model('PostTag');
    const Tag = ctx.model('Tag');
    const id = this._id;
    const existed = ReadOnlyPostTag.find({post_id: id}).map(pickID);

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
      const ref = ReadOnlyPostTag.findOne({post_id: id, tag_id: tag._id});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostTag.insert({
        post_id: id,
        tag_id: tag._id
      });
    }).then(tags => {
      // Remove old tags
      const deleted = existed.filter(item => !tags.map(pickID).includes(item));
      return deleted;
    }).map(tag => PostTag.removeById(tag));
  });

  Post.virtual('categories').get(function() {
    const ReadOnlyPostCategory = ctx._binaryRelationIndex.post_category;
    const Category = ctx.model('Category');

    const ids = ReadOnlyPostCategory.find({post_id: this._id}).map(item => item.category_id);

    return Category.find({_id: {$in: ids}});
  });

  Post.method('setCategories', function(cats: (string | string[])[]) {
    if (this.notPublished()) {
      cats = [];
    }
    // Remove empty categories, preserving hierarchies
    cats = cats.filter(cat => {
      return Array.isArray(cat) || (cat != null && cat !== '');
    }).map(cat => {
      return Array.isArray(cat) ? removeEmptyTag(cat) : `${cat}`;
    });

    const ReadOnlyPostCategory = ctx._binaryRelationIndex.post_category;
    const PostCategory = ctx.model('PostCategory');
    const Category = ctx.model('Category');
    const id = this._id;
    const allIds: string[] = [];
    const existed = ReadOnlyPostCategory.find({post_id: id}).map(pickID);
    const hasHierarchy = cats.filter(Array.isArray).length > 0;

    // Add a hierarchy of categories
    const addHierarchy = (catHierarchy: string | string[]) => {
      const parentIds = [];
      if (!Array.isArray(catHierarchy)) catHierarchy = [catHierarchy];
      // Don't use "Promise.map". It doesn't run in series.
      // MUST USE "Promise.each".
      return Promise.each(catHierarchy, (cat, i) => {
        // Find the category by name
        const data: CategorySchema = Category.findOne({
          name: cat,
          parent: i ? parentIds[i - 1] : {$exists: false}
        }, {lean: true});

        if (data) {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        }

        // Insert the category if not exist
        const obj: {name: string, parent?: string} = {name: cat};
        if (i) obj.parent = parentIds[i - 1];

        return Category.insert(obj).catch(err => {
          // Try to find the category again. Throw the error if not found
          const data: CategorySchema = Category.findOne({
            name: cat,
            parent: i ? parentIds[i - 1] : {$exists: false}
          }, {lean: true});

          if (data) return data;
          throw err;
        }).then((data: CategorySchema) => {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        });
      });
    };

    return (hasHierarchy ? Promise.each(cats, addHierarchy) : Promise.resolve(addHierarchy(cats as string[]))
    ).then(() => allIds).map(catId => {
      // Find the reference
      const ref: PostCategorySchema = ReadOnlyPostCategory.findOne({post_id: id, category_id: catId});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostCategory.insert({
        post_id: id,
        category_id: catId
      });
    }).then((postCats: PostCategorySchema[]) => // Remove old categories
      existed.filter(item => !postCats.map(pickID).includes(item))).map(cat => PostCategory.removeById(cat));
  });

  // Remove PostTag references
  Post.pre('remove', (data: PostSchema) => {
    const PostTag = ctx.model('PostTag');
    return PostTag.remove({post_id: data._id});
  });

  // Remove PostCategory references
  Post.pre('remove', (data: PostSchema) => {
    const PostCategory = ctx.model('PostCategory');
    return PostCategory.remove({post_id: data._id});
  });

  // Remove assets
  Post.pre('remove', (data: PostSchema) => {
    const PostAsset = ctx.model('PostAsset');
    return PostAsset.remove({post: data._id});
  });

  return Post;
};
