import Hexo from '../../../lib/hexo';
import renderHelper from '../../../lib/plugins/helper/render';
import markdownHelper from '../../../lib/plugins/helper/markdown';
type MarkdownHelperParams = Parameters<typeof markdownHelper>;
type MarkdownHelperReturn = ReturnType<typeof markdownHelper>;

describe('markdown', () => {
  const hexo = new Hexo(__dirname);

  const ctx = {
    render: renderHelper(hexo)
  };

  const markdown: (...args: MarkdownHelperParams) => MarkdownHelperReturn = markdownHelper.bind(ctx);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});
