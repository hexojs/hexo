import warehouse from 'warehouse';
import { join } from 'path';
import type Hexo from '../hexo';

export = (ctx: Hexo) => {
  const PostAsset = new warehouse.Schema({
    _id: {type: String, required: true},
    slug: {type: String, required: true},
    modified: {type: Boolean, default: true},
    post: {type: warehouse.Schema.Types.CUID, ref: 'Post'},
    renderable: {type: Boolean, default: true}
  });

  PostAsset.virtual('path').get(function() {
    const Post = ctx.model('Post');
    const post = Post.findById(this.post);
    if (!post) return;

    // PostAsset.path is file path relative to `public_dir`
    // no need to urlescape, #1562
    // strip /\.html?$/ extensions on permalink, #2134
    return join(post.path.replace(/\.html?$/, ''), this.slug);
  });

  PostAsset.virtual('source').get(function() {
    return join(ctx.base_dir, this._id);
  });

  return PostAsset;
};
