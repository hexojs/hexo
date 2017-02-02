'use strict';

var abbrev = require('abbrev');

var store = {
  page: require('./page'),
  post: require('./post'),
  route: require('./route'),
  tag: require('./tag'),
  category: require('./category')
};

var alias = abbrev(Object.keys(store));

function listConsole(args) {
  var type = args._.shift();
  var self = this;

  // Display help message if user didn't input any arguments
  if (!type || !alias[type]) {
    return this.call('help', {_: ['list']});
  }

  return this.load().then(function() {
    return store[alias[type]].call(self, args);
  });
}

module.exports = listConsole;
