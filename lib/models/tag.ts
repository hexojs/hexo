import warehouse from 'warehouse';
import { slugize, full_url_for } from 'hexo-util';
const { hasOwnProperty: hasOwn } = Object.prototype;
import type Hexo from '../hexo';
import type { TagSchema } from '../types';

export = (ctx: Hexo) => {
  const Tag = new warehouse.Schema<TagSchema>({
    name: {type: String, required: true}
  });

  Tag.virtual('slug').get(function() {
    const map = ctx.config.tag_map || {};
    let name = this.name;
    if (!name) return;

    if (Reflect.apply(hasOwn, map, [name])) {
      name = map[name] || name;
    }

    return slugize(name, {transform: ctx.config.filename_case});
  });

  Tag.virtual('path').get(function() {
    let tagDir = ctx.config.tag_dir;
    if (!tagDir.endsWith('/')) tagDir += '/';

    return `${tagDir + this.slug}/`;
  });

  Tag.virtual('permalink').get(function() {
    return full_url_for.call(ctx, this.path);
  });

  Tag.virtual('posts').get(function() {
    const ReadOnlyPostTag = ctx._binaryRelationIndex.post_tag;

    const ids = ReadOnlyPostTag.find({tag_id: this._id}).map(item => item.post_id);

    return ctx.locals.get('posts').find({
      _id: {$in: ids}
    });
  });

  Tag.virtual('length').get(function() {
    // Note: this.posts.length is also working
    // But it's slow because `find` has to iterate over all posts
    const ReadOnlyPostTag = ctx._binaryRelationIndex.post_tag;

    return ReadOnlyPostTag.find({tag_id: this._id}).length;
  });

  // Check whether a tag exists
  Tag.pre('save', (data: TagSchema) => {
    const { name } = data;
    if (!name) return;

    const Tag = ctx.model('Tag');
    const tag = Tag.findOne({name}, {lean: true});

    if (tag) {
      throw new Error(`Tag \`${name}\` has already existed!`);
    }
  });

  // Remove PostTag references
  Tag.pre('remove', (data: TagSchema) => {
    const PostTag = ctx.model('PostTag');
    return PostTag.remove({tag_id: data._id});
  });

  return Tag;
};
