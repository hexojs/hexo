'use strict';

const { load } = require('js-yaml');
const { escape } = require('hexo-front-matter');

function yamlHelper({ text }) {
  return load(escape(text));
}

module.exports = yamlHelper;
