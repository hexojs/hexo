'use strict';

const yaml = require('js-yaml');
const { escape } = require('hexo-front-matter');

function yamlHelper(data) {
  return yaml.load(escape(data.text));
}

module.exports = yamlHelper;
