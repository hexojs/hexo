'use strict';

var Promise = require('bluebird');

function renderPostFilter(){
  /* jshint validthis: true */
  var self = this;

  function renderPosts(model){
    return Promise.map(model.toArray(), function(post){
      post.content = post._content;

      return self.post.render(post.full_source, post).then(function(){
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