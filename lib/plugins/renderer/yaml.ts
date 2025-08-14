import yaml from 'js-yaml';
import { escape } from 'hexo-front-matter';
import logger from 'hexo-log';
import type { StoreFunctionData } from '../../extend/renderer.js';

let schema: yaml.Schema;
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

function yamlHelper(data: StoreFunctionData): any {
  return yaml.load(escape(data.text), { schema });
}

// For ESM/CommonJS compatibility
export default yamlHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = yamlHelper;
  module.exports.default = yamlHelper;
}
