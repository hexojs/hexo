import type { PostGenerator, PostSchema, SiteLocals } from '../../types';

function postGenerator(locals: SiteLocals): PostGenerator[] {
  const posts = locals.posts.sort('-date').toArray();
  const { length } = posts;

  return posts.map((post: PostSchema, i: number) => {
    const { path, layout } = post;

    if (!layout || layout === 'false') {
      return {
        path,
        data: post.content
      };
    }

    if (i) post.prev = posts[i - 1];
    if (i < length - 1) post.next = posts[i + 1];

    const layouts = ['post', 'page', 'index'];
    if (layout !== 'post') layouts.unshift(layout);

    post.__post = true;

    return {
      path,
      layout: layouts,
      data: post
    };
  });
}

export = postGenerator;
