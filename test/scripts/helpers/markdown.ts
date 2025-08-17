import { testCwd } from '../../util/env';
import Hexo from '../../../lib/hexo';
import renderHelper from '../../../lib/plugins/helper/render';
import markdownHelper from '../../../lib/plugins/helper/markdown';
import { join } from 'path';
type MarkdownHelperParams = Parameters<typeof markdownHelper>;
type MarkdownHelperReturn = ReturnType<typeof markdownHelper>;

describe('markdown', () => {
  const hexo = new Hexo(testCwd);

  const ctx = {
    render: renderHelper(hexo)
  };

  const markdown: (...args: MarkdownHelperParams) => MarkdownHelperReturn = markdownHelper.bind(ctx);

  before(async () => {
    await hexo.init();
    const rendererPath = join(process.cwd(), 'node_modules/hexo-renderer-marked/index.js');
    await hexo.loadPlugin(rendererPath);
  });

  it('default', () => {
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});
