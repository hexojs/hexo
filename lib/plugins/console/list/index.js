'use strict';

const abbrev = require('abbrev');
const page = require('./page');
const post = require('./post');
const route = require('./route');
const tag = require('./tag');
const category = require('./category');

const store = {
  page, post, route, tag, category
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
