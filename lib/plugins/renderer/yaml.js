'use strict';

var yaml = require('js-yaml');
var escapeYAML = require('hexo-front-matter').escape;

function yamlHelper(data) {
  return yaml.load(escapeYAML(data.text));
}

module.exports = yamlHelper;
