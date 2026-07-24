import chai from 'chai';
import nunjucks from 'nunjucks';
import Hexo from '../../../lib/hexo';
import { scanPostSegments } from '../../../lib/hexo/post_render_lexer';
import PostRenderProcessor from '../../../lib/hexo/post_render_processor';

chai.should();

describe('Post render lexer', () => {
  const hexo = new Hexo();

  it('finds HTML comments only outside Markdown code', () => {
    const content = [
      '```html',
      '<!-- fenced -->',
      '```',
      '> ~~~html',
      '> <!-- blockquote fenced -->',
      '> ~~~',
      '`<!-- inline -->`',
      '<!-- visible -->'
    ].join('\n');

    const comments = scanPostSegments(content)
      .filter(segment => segment.type === 'html-comment')
      .map(({ start, end }) => content.slice(start, end));

    comments.should.eql(['<!-- visible -->']);
  });

  it('returns fenced code metadata for the post renderer', () => {
    const content = [
      '> ```js',
      '> const value = 1;',
      '> ````',
      'after'
    ].join('\n');

    const fence = scanPostSegments(content).find(segment => segment.type === 'fenced-code');

    chai.expect(fence).to.exist;
    if (!fence || fence.type !== 'fenced-code') return;
    fence.closed.should.be.true;
    fence.prefix.should.eql('> ');
    fence.marker.should.eql('```');
    fence.info.should.eql('js');
    content.slice(fence.contentStart, fence.contentEnd).should.eql('> const value = 1;\n');
    content.slice(fence.closingEnd, fence.end).should.eql('\n');
  });

  it('pairs same-name nested Nunjucks blocks', () => {
    const content = [
      '{% folding outer %}',
      '{% tabs install %}',
      '{% folding inner %}',
      '{% endfolding %}',
      '{% endtabs %}',
      '{% endfolding %}'
    ].join('\n');
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(1);
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('keeps Nunjucks syntax in HTML comments literal', () => {
    const content = '<!-- tab {{ 1 + 1 }} -->';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);
    const restored = processor.restoreComments(processor.restoreAllSwigTags(escaped));

    nunjucks.renderString(restored, {}).should.eql(content);
  });

  it('preserves raw blocks containing backticks in inline code', () => {
    const content = '`{% raw %}test`111`{{ value }}{% endraw %}`';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    processor.hasNunjucks.should.be.true;
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('does not close a Nunjucks variable on a delimiter inside a string', () => {
    const content = 'before {{ "}}" }} after';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(1);
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('distinguishes division from a Nunjucks regex literal', () => {
    const content = [
      '{{ bar/baz }}',
      '{% if value is matching(r/%}/) %}yes{% endif %}'
    ].join('\n');
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(2);
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });
});
