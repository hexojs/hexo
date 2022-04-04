'use strict';

const yaml = require('js-yaml');
const { escape } = require('hexo-front-matter');
const log = require('hexo-log')();

let schema = {};
// FIXME: workaround for https://github.com/hexojs/hexo/issues/4917
try {
  schema = yaml.DEFAULT_SCHEMA.extend(require('js-yaml-js-types').all);
} catch (e) {
  if (e instanceof yaml.YAMLException) {
    log.warn('YAMLException: please see https://github.com/hexojs/hexo/issues/4917');
  } else {
    throw e;
  }
}

function yamlHelper(data) {
  return yaml.load(escape(data.text), { schema });
}

module.exports = yamlHelper;
