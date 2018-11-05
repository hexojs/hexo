'use strict';

const abbrev = require('abbrev');

const store = {
  page: require('./page'),
  post: require('./post'),
  route: require('./route'),
  tag: require('./tag'),
  category: require('./category')
};

const alias = abbrev(Object.keys(store));

function listConsole(args) {
  const type = args._.shift();

  // Display help message if user didn't input any arguments
  if (!type || !alias[type]) {
    return this.call('help', {_: ['list']});
  }

  return this.load().then(() => Reflect.apply(store[alias[type]], this, [args]));
}

module.exports = listConsole;
