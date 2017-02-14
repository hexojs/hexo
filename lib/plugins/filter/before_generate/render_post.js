'use strict';

var Promise = require('bluebird');

function renderPostFilter(data) {
  var self = this;

  function renderPosts(model) {
    var posts = model.toArray().filter(function(post) {
      return post.content == null;
    });

    return Promise.map(posts, function(post) {
      post.content = post._content;
      post.site = {data: data};

      return self.post.render(post.full_source, post).then(function() {
        return post.save();
      });
    });
  }

  return Promise.all([
    renderPosts(this.model('Post')),
    renderPosts(this.model('Page'))
  ]);
}

module.exports = renderPostFilter;
