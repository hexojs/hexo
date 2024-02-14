import { isExternalLink } from 'hexo-util';
import Hexo from '../../../hexo';

let EXTERNAL_LINK_SITE_ENABLED = true;
const rATag = /<a(?:\s+?|\s+?[^<>]+?\s+?)href=["']((?:https?:|\/\/)[^<>"']+)["'][^<>]*>/gi;
const rTargetAttr = /target=/i;
const rRelAttr = /rel=/i;
const rRelStrAttr = /rel=["']([^<>"']*)["']/i;

function externalLinkFilter(this: Hexo, data: string): string {
  if (!EXTERNAL_LINK_SITE_ENABLED) return;

  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'site') {
    EXTERNAL_LINK_SITE_ENABLED = false;
    return;
  }

  return data.replace(rATag, (str, href) => {
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
