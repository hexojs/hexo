var hooks = require('./hooks/category');

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