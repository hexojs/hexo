import chai from 'chai';
import nunjucks from 'nunjucks';
import PostRenderEscape, { scanPostSegments } from '../../../lib/hexo/post_render_lexer';

chai.should();

describe('PostRenderEscape', () => {
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

  it('returns fenced code metadata for downstream filters', () => {
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
    const escape = new PostRenderEscape();

    const escaped = escape.escapeAllSwigTags(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(1);
    escape.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('keeps Nunjucks syntax in HTML comments literal', () => {
    const content = '<!-- tab {{ 1 + 1 }} -->';
    const escape = new PostRenderEscape();

    const escaped = escape.escapeAllSwigTags(content);
    const restored = escape.restoreComments(escape.restoreAllSwigTags(escaped));

    nunjucks.renderString(restored, {}).should.eql(content);
  });

  it('preserves raw blocks containing backticks in inline code', () => {
    const content = '`{% raw %}test`111`{{ value }}{% endraw %}`';
    const escape = new PostRenderEscape();

    const escaped = escape.escapeAllSwigTags(content);

    escape.hasNunjucks.should.be.true;
    escape.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('does not close a Nunjucks variable on a delimiter inside a string', () => {
    const content = 'before {{ "}}" }} after';
    const escape = new PostRenderEscape();

    const escaped = escape.escapeAllSwigTags(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(1);
    escape.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('distinguishes division from a Nunjucks regex literal', () => {
    const content = [
      '{{ bar/baz }}',
      '{% if value is matching(r/%}/) %}yes{% endif %}'
    ].join('\n');
    const escape = new PostRenderEscape();

    const escaped = escape.escapeAllSwigTags(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(2);
    escape.restoreAllSwigTags(escaped).should.eql(content);
  });
});
