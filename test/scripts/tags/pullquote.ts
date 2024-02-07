import Hexo from '../../../lib/hexo';
import tagPullquote from '../../../lib/plugins/tag/pullquote';

describe('pullquote', () => {
  const hexo = new Hexo(__dirname);
  const pullquote = tagPullquote(hexo);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    const result = pullquote([], '123456 **bold** and *italic*');
    result.should.eql('<blockquote class="pullquote"><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('class', () => {
    const result = pullquote(['foo', 'bar'], '');
    result.should.eql('<blockquote class="pullquote foo bar"></blockquote>');
  });
});
