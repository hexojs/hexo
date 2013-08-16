var hooks = require('./hooks/post');

exports.hooks = {
  pre: {
    save: [hooks.createCategory, hooks.createTag],
    remove: []
  },
  post: {
    save: [hooks.addToCategory, hooks.addToTag],
    remove: []
  }
};