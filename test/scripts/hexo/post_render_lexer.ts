import chai from 'chai';
import nunjucks from 'nunjucks';
import Hexo from '../../../lib/hexo';
import { lexPost } from '../../../lib/hexo/post_render_lexer';
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

    const comments = lexPost(content).segments
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

    const fence = lexPost(content).segments.find(segment => segment.type === 'fenced-code');

    chai.expect(fence).to.exist;
    if (!fence || fence.type !== 'fenced-code') return;
    fence.closed.should.be.true;
    fence.prefix.should.eql('> ');
    fence.marker.should.eql('```');
    fence.info.should.eql('js');
    content.slice(fence.contentStart, fence.contentEnd).should.eql('> const value = 1;\n');
    content.slice(fence.closingEnd, fence.end).should.eql('\n');
  });

  it('treats Nunjucks tokens as opaque to Markdown and HTML delimiters', () => {
    const content = [
      '{{ "`code` <!--" }}',
      '{% test "`title` <!--" %}'
    ].join('\n');
    const tokens = lexPost(content);

    tokens.nunjucks.map(token => content.slice(token.start, token.end)).should.eql([
      '{{ "`code` <!--" }}',
      '{% test "`title` <!--" %}'
    ]);
    tokens.segments.map(segment => segment.type).should.eql(['text']);
  });

  it('keeps Nunjucks inactive inside Markdown code and HTML comments', () => {
    const content = [
      '`{{ "<!--" }}`',
      '<!-- {{ "`code`" }} -->',
      '```njk',
      '{{ "<!--" }}',
      '```'
    ].join('\n');
    const tokens = lexPost(content);

    tokens.nunjucks.should.be.empty;
    tokens.segments
      .filter(segment => segment.type !== 'text')
      .map(segment => segment.type)
      .should.eql(['inline-code', 'html-comment', 'fenced-code']);
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

  it('preserves backticks inside an atomic Nunjucks variable', () => {
    const content = '{{ "`code`" }}';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    processor.hasNunjucks.should.be.true;
    escaped.should.not.include('hexoPostRenderContext');
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('preserves backticks inside an atomic Nunjucks tag', () => {
    const content = '{% test "`code`" %}';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    processor.hasNunjucks.should.be.true;
    escaped.should.not.include('hexoPostRenderContext');
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('keeps an HTML comment opener inside a Nunjucks string', () => {
    const content = '{{ "<!--" }}';
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    processor.hasNunjucks.should.be.true;
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });

  it('distinguishes division from a Nunjucks regex literal', () => {
    const content = [
      '{{ bar/baz }}',
      '{% if value is matching(r/%}/) %}yes{% endif %}',
      '{% if value is matching(r/[\\/%}]/) %}yes{% endif %}'
    ].join('\n');
    const processor = new PostRenderProcessor(hexo);

    const escaped = processor.prepare(content);

    (escaped.match(/<!--swig/g) || []).length.should.eql(3);
    processor.restoreAllSwigTags(escaped).should.eql(content);
  });
});
