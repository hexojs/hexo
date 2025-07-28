import Promise from 'bluebird';
import type Hexo from '../../../hexo/index.js';
import type Model from 'warehouse/dist/model';

function renderPostFilter(this: Hexo): Promise<[any[], any[]]> {
  const renderPosts = (model: Model<any>) => {
    const posts = model.toArray().filter(post => post.content == null);

    return Promise.map(posts, (post: any) => {
      post.content = post._content;

      return this.post.render(post.full_source, post).then(() => post.save());
    });
  };

  return Promise.all([
    renderPosts(this.model('Post')),
    renderPosts(this.model('Page'))
  ]);
}

// For ESM/CommonJS compatibility
export default renderPostFilter;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = renderPostFilter;
  module.exports.default = renderPostFilter;
}
