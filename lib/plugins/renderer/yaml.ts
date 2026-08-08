import { escape } from 'hexo-front-matter';
import type { ScalarTag } from 'yaml';
import type { StoreFunctionData } from '../../extend/renderer';
import parseYaml from '../../hexo/yaml';

const jsRegexp: ScalarTag = {
  identify: value => value instanceof RegExp,
  tag: 'tag:yaml.org,2002:js/regexp',
  resolve(value, onError) {
    if (!value) {
      onError('Invalid RegExp value');
      return value;
    }

    let regexp = value;
    let modifiers = '';

    if (regexp[0] === '/') {
      const tail = /\/([gim]*)$/.exec(regexp);
      if (tail) modifiers = tail[1];

      if (regexp[regexp.length - modifiers.length - 1] !== '/') {
        onError('Invalid RegExp value');
        return value;
      }

      regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
    }

    try {
      return new RegExp(regexp, modifiers);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Invalid RegExp value');
      return value;
    }
  }
};

function yamlHelper(data: StoreFunctionData): any {
  return parseYaml(escape(data.text), { customTags: [jsRegexp] });
}

export = yamlHelper;
