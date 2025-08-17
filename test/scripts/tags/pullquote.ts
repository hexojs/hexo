import { join } from 'path';
import Hexo from '../../../lib/hexo';
import tagPullquote from '../../../lib/plugins/tag/pullquote';
import { testCwd } from '../../util/env';

describe('pullquote', () => {
  const hexo = new Hexo(testCwd);
  const pullquote = tagPullquote(hexo);

  before(async () => {
    await hexo.init();
    const rendererPath = join(process.cwd(), 'node_modules/hexo-renderer-marked/index.js');
    await hexo.loadPlugin(rendererPath);
  });

  it('default', () => {
    const result = pullquote([], '123456 **bold** and *italic*');
    result.should.eql('<blockquote class="pullquote"><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('class', () => {
    const result = pullquote(['foo', 'bar'], '');
    result.should.eql('<blockquote class="pullquote foo bar"></blockquote>');
  });
});
