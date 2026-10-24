import yaml from 'js-yaml';
import { escape } from 'hexo-front-matter';
import logger from 'hexo-log';
import type { StoreFunctionData } from '../../extend/renderer';

let schema: yaml.Schema;
// FIXME: workaround for https://github.com/hexojs/hexo/issues/4917
try {
  // Only enable the safe js types (regexp/undefined); the executable
  // `function` type must not be enabled by default.
  // See https://github.com/hexojs/hexo/issues/5801
  schema = yaml.DEFAULT_SCHEMA.extend([
    require('js-yaml-js-types').regexp,
    require('js-yaml-js-types').undefined
  ]);
} catch (e) {
  if (e instanceof yaml.YAMLException) {
    logger().warn('YAMLException: please see https://github.com/hexojs/hexo/issues/4917');
  } else {
    throw e;
  }
}

function yamlHelper(data: StoreFunctionData): any {
  return yaml.load(escape(data.text), { schema });
}

export = yamlHelper;
