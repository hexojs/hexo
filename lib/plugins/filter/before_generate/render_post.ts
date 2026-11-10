import { promiseMap } from '../../../util/promise';
import type Hexo from '../../../hexo';
import type Model from 'warehouse/dist/model';

function renderPostFilter(this: Hexo): Promise<[any[], any[]]> {
  const renderPosts = (model: Model<any>) => {
    const posts = model.toArray().filter(post => post.content == null);

    return promiseMap(posts, (post: any) => {
      post.content = post._content;

      return this.post.render(post.full_source, post).then(() => post.save());
    });
  };

  return Promise.all([
    renderPosts(this.model('Post')),
    renderPosts(this.model('Page'))
  ]);
}

export = renderPostFilter;
