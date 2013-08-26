var hooks = require('./hooks/post');

exports.hooks = {
  pre: {
    save: [hooks.createCategory, hooks.createTag, hooks.updateCategory, hooks.updateTag],
    remove: [hooks.removeFromCategory, hooks.removeFromTag]
  },
  post: {
    save: [hooks.addToCategory, hooks.addToTag],
    remove: []
  }
};