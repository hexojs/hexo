import warehouse from 'warehouse';
import { slugize, full_url_for } from 'hexo-util';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const Category = new warehouse.Schema({
    name: {type: String, required: true},
    parent: { type: warehouse.Schema.Types.CUID, ref: 'Category'}
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
    if (!catDir.endsWith('/')) catDir += '/';

    return `${catDir + this.slug}/`;
  });

  Category.virtual('permalink').get(function() {
    return full_url_for.call(ctx, this.path);
  });

  Category.virtual('posts').get(function() {
    const PostCategory = ctx.model('PostCategory');

    const ids = PostCategory.find({category_id: this._id}).map(item => item.post_id);

    return ctx.locals.get('posts').find({
      _id: {$in: ids}
    });
  });

  Category.virtual('length').get(function() {
    const PostCategory = ctx.model('PostCategory');

    return PostCategory.find({category_id: this._id}).length;
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
