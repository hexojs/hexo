'use strict';

const Promise = require('bluebird');
const { WorkerPool } = require('hexo-util');
const { join, dirname } = require('path');
let pool;

function renderPostFilter(data) {
  pool = new WorkerPool(join(dirname(dirname(dirname(__dirname))), 'workers', 'backtick_codeblock_worker.js'));

  const renderPosts = model => {
    const posts = model.toArray().filter(post => post.content == null);

    return Promise.map(posts, post => {
      return Promise.resolve(post._content).then(_content => {
        return pool.run({ input: _content, highlightCfg: this.config.highlight, prismjsCfg: this.config.prismjs });
      }).then(content => {
        post.content = content;
        post.site = { data };

        return this.post.render(post.full_source, post).then(() => post.save());
      });
    });
  };

  return Promise.all([
    renderPosts(this.model('Post')),
    renderPosts(this.model('Page'))
  ]).then(() => {
    pool.destroy();
  });
}

module.exports = renderPostFilter;
