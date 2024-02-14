import { isExternalLink } from 'hexo-util';
import type Hexo from '../../../hexo';
import type { RenderData } from '../../../types';

let EXTERNAL_LINK_POST_ENABLED = true;
const rATag = /<a(?:\s+?|\s+?[^<>]+?\s+?)href=["']((?:https?:|\/\/)[^<>"']+)["'][^<>]*>/gi;
const rTargetAttr = /target=/i;
const rRelAttr = /rel=/i;
const rRelStrAttr = /rel=["']([^<>"']*)["']/i;

function externalLinkFilter(this: Hexo, data: RenderData): void {
  if (!EXTERNAL_LINK_POST_ENABLED) return;

  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'post') {
    EXTERNAL_LINK_POST_ENABLED = false;
    return;
  }

  data.content = data.content.replace(rATag, (str, href) => {
    if (!isExternalLink(href, url, external_link.exclude as any) || rTargetAttr.test(str)) return str;

    if (rRelAttr.test(str)) {
      str = str.replace(rRelStrAttr, (relStr, rel) => {
        return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace('href=', 'target="_blank" href=');
    }

    return str.replace('href=', 'target="_blank" rel="noopener" href=');
  });
}

export = externalLinkFilter;
