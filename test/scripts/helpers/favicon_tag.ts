import Hexo from '../../../lib/hexo';
import faviconTag from '../../../lib/plugins/helper/favicon_tag';
type faviconTagParams = Parameters<typeof faviconTag>;
type faviconTagReturn = ReturnType<typeof faviconTag>;

describe('favicon_tag', () => {
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  const favicon: (...args: faviconTagParams) => faviconTagReturn = faviconTag.bind(ctx);

  it('path', () => {
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});
