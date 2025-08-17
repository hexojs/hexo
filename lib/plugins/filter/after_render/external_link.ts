import { isExternalLink } from 'hexo-util';
import type Hexo from '../../../hexo/index.js';

let EXTERNAL_LINK_SITE_ENABLED = true;
const rATag = /<a(?:\s+?|\s+?[^<>]+?\s+?)href=["']((?:https?:|\/\/)[^<>"']+)["'][^<>]*>/gi;
const rTargetAttr = /target=/i;
const rRelAttr = /rel=/i;
const rRelStrAttr = /rel=["']([^<>"']*)["']/i;

const addNoopener = (relStr: string, rel: string) => {
  return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
};

function externalLinkFilter(this: Hexo, data: string): string {
  if (!EXTERNAL_LINK_SITE_ENABLED) return;

  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'site') {
    EXTERNAL_LINK_SITE_ENABLED = false;
    return;
  }

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray;

  while ((match = rATag.exec(data)) !== null) {
    result += data.slice(lastIndex, match.index);

    const str = match[0];
    const href = match[1];

    if (!isExternalLink(href, url, external_link.exclude as any) || rTargetAttr.test(str)) {
      result += str;
    } else {
      if (rRelAttr.test(str)) {
        result += str.replace(rRelStrAttr, addNoopener).replace('href=', 'target="_blank" href=');
      } else {
        result += str.replace('href=', 'target="_blank" rel="noopener" href=');
      }
    }
    lastIndex = rATag.lastIndex;
  }
  result += data.slice(lastIndex);

  return result;
}

export default externalLinkFilter;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = externalLinkFilter;
  module.exports.default = externalLinkFilter;
}
