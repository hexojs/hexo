'use strict';

const yaml = require('js-yaml');
const { escape } = require('hexo-front-matter');
const schema = yaml.DEFAULT_SCHEMA.extend(require('js-yaml-js-types').all);

function yamlHelper(data) {
  return yaml.load(escape(data.text), { schema });
}

module.exports = yamlHelper;
