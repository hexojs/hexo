var hooks = require('./hooks/tag');

exports.hooks = {
  pre: {
    save: [],
    remove: [hooks.removeFromPost]
  },
  post: {
    save: [],
    remove: []
  }
};