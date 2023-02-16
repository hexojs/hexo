import Promise from 'bluebird';

function renderPostFilter(data) {
  const renderPosts = model => {
    const posts = model.toArray().filter(post => post.content == null);

    return Promise.map(posts, (post: any) => {
      post.content = post._content;
      post.site = {data};

      return this.post.render(post.full_source, post).then(() => post.save());
    });
  };

  return Promise.all([
    renderPosts(this.model('Post')),
    renderPosts(this.model('Page'))
  ]);
}

export = renderPostFilter;
