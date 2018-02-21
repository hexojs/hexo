'use strict';

const yaml = require('js-yaml');
const escapeYAML = require('hexo-front-matter').escape;

function yamlHelper(data) {
  return yaml.load(escapeYAML(data.text));
}

module.exports = yamlHelper;
