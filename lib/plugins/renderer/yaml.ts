import yaml from 'js-yaml';
import { escape } from 'hexo-front-matter';
import logger from 'hexo-log';

let schema = {};
// FIXME: workaround for https://github.com/hexojs/hexo/issues/4917
try {
  schema = yaml.DEFAULT_SCHEMA.extend(require('js-yaml-js-types').all);
} catch (e) {
  if (e instanceof yaml.YAMLException) {
    logger().warn('YAMLException: please see https://github.com/hexojs/hexo/issues/4917');
  } else {
    throw e;
  }
}

function yamlHelper(data) {
  return yaml.load(escape(data.text), { schema });
}

export = yamlHelper;
