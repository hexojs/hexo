import Hexo from '../../../lib/hexo';
import excerptFilter from '../../../lib/plugins/filter/after_post_render/excerpt';
type ExcerptFilterParams = Parameters<typeof excerptFilter>;
type ExcerptFilterReturn = ReturnType<typeof excerptFilter>;

describe('Excerpt', () => {
  const hexo = new Hexo();
  const excerpt: (...args: ExcerptFilterParams) => ExcerptFilterReturn = excerptFilter.bind(hexo);

  it('without <!-- more -->', () => {
    const content = [
      'foo',
      'bar',
      'baz'
    ].join('\n');

    const data: {
      content: string;
      excerpt?: string;
      more?: string;
    } = {
      content
    };

    excerpt(data);
    data.content.should.eql(content);
    data.excerpt!.should.eql('');
    data.more!.should.eql(content);
  });

  it('with <!-- more -->', () => {
    const _moreCases = [
      '<!-- more -->',
      '<!-- more-->',
      '<!--more -->',
      '<!--more-->'
    ];

    _moreCases.forEach(moreCase => _test(moreCase));

    function _test(more) {
      const content = [
        'foo',
        'bar',
        more,
        'baz'
      ].join('\n');

      const data: {
        content: string;
        excerpt?: string;
        more?: string;
      } = {
        content
      };

      excerpt(data);

      data.content.should.eql([
        'foo',
        'bar',
        '<span id="more"></span>',
        'baz'
      ].join('\n'));

      data.excerpt!.should.eql([
        'foo',
        'bar'
      ].join('\n'));

      data.more!.should.eql([
        'baz'
      ].join('\n'));
    }
  });

  it('multiple <!-- more -->', () => {
    const content = [
      'foo',
      '<!-- more -->',
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n');

    const data: {
      content: string;
      excerpt?: string;
      more?: string;
    } = {
      content
    };

    excerpt(data);

    data.content.should.eql([
      'foo',
      '<span id="more"></span>',
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n'));

    data.excerpt!.should.eql([
      'foo'
    ].join('\n'));

    data.more!.should.eql([
      'bar',
      '<!-- more -->',
      'baz'
    ].join('\n'));
  });

  it('skip processing if post/page.excerpt is present in the front-matter', () => {
    const content = [
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n');

    const data: {
      content: string;
      excerpt: string;
      more?: string;
    } = {
      content,
      excerpt: 'baz'
    };

    excerpt(data);

    data.content.should.eql([
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n'));

    data.excerpt.should.eql([
      'baz'
    ].join('\n'));

    data.more!.should.eql([
      'foo',
      '<!-- more -->',
      'bar'
    ].join('\n'));
  });
});
