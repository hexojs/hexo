import { isExternalLink } from 'hexo-util';
import type Hexo from '../../../hexo';
import type { RenderData } from '../../../types';

const rATag = /<a\s[^<>]*?href=["']((?:https?:|\/\/)[^<>"']+)["'][^<>]*>/gi;
const rTargetAttr = /target=/i;
const rRelAttr = /rel=/i;
const rRelStrAttr = /rel=["']([^<>"']*)["']/i;

function externalLinkFilter(this: Hexo, data: RenderData): void {
  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'post') {
    return;
  }

  data.content = data.content.replace(rATag, (str, href) => {
    if (!isExternalLink(href, url, external_link.exclude as any) || rTargetAttr.test(str)) return str;

    if (rRelAttr.test(str)) {
      str = str.replace(rRelStrAttr, (relStr, rel) => {
        return rel.includes('noopener') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace('href=', 'target="_blank" href=');
    }

    return str.replace('href=', 'target="_blank" rel="noopener" href=');
  });
}

export = externalLinkFilter;
