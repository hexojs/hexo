// @ts-ignore
import Promise from 'bluebird';
import Hexo from '../../../lib/hexo';
import tagcloudHelper from '../../../lib/plugins/helper/tagcloud';
import chai from 'chai';
const should = chai.should();
type TagcloudHelperParams = Parameters<typeof tagcloudHelper>;
type TagcloudHelperReturn = ReturnType<typeof tagcloudHelper>;

describe('tagcloud', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');
  const Tag = hexo.model('Tag');

  const ctx: any = {
    config: hexo.config
  };

  const tagcloud: (...args: TagcloudHelperParams) => TagcloudHelperReturn = tagcloudHelper.bind(ctx);

  before(async () => {
    await hexo.init();
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo'},
      {source: 'bar', slug: 'bar'},
      {source: 'baz', slug: 'baz'},
      {source: 'boo', slug: 'boo'}
    ]);
    // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
    await Promise.all([
      ['bcd'],
      ['bcd', 'cde'],
      ['bcd', 'cde', 'abc'],
      ['bcd', 'cde', 'abc', 'def']
    ].map((tags, i) => posts[i].setTags(tags)));

    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  });

  it('default', () => {
    const result = tagcloud();

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px;">def</a>'
    ].join(' '));
  });

  it('no tags', async () => {
    const hexo = new Hexo(__dirname);
    await hexo.init();
    hexo.locals.invalidate();
    // @ts-ignore
    hexo.site = hexo.locals.toObject();
    const tagcloud: (...args: TagcloudHelperParams) => TagcloudHelperReturn = tagcloudHelper.bind(hexo);

    const result = tagcloud();

    result.should.eql('');
  });

  it('specified collection', () => {
    const result = tagcloud(Tag.find({
      name: /bc/
    }));

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 10px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(' '));
  });

  it('font size', () => {
    const result = tagcloud({
      min_font: 15,
      max_font: 30
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 20px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 30px;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 25px;">cde</a>',
      '<a href="/tags/def/" style="font-size: 15px;">def</a>'
    ].join(' '));
  });

  it('font size - when every tag has the same number of posts, font-size should be minimum.', () => {
    const result = tagcloud(Tag.find({
      name: /abc/
    }), {
      min_font: 15,
      max_font: 30
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 15px;">abc</a>'
    ].join(' '));
  });

  it('font unit', () => {
    const result = tagcloud({
      unit: 'em'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33em;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20em;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67em;">cde</a>',
      '<a href="/tags/def/" style="font-size: 10em;">def</a>'
    ].join(' '));
  });

  it('orderby - length', () => {
    const result = tagcloud({
      orderby: 'length'
    });

    result.should.eql([
      '<a href="/tags/def/" style="font-size: 10px;">def</a>',
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(' '));
  });

  it('orderby - random', () => {
    const result1 = tagcloud({
      orderby: 'random'
    });

    const result2 = tagcloud({
      orderby: 'rand'
    });

    result1.should.have.string('<a href="/tags/def/" style="font-size: 10px;">def</a>');
    result1.should.have.string('<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>');
    result1.should.have.string('<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>');
    result1.should.have.string('<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>');
    result2.should.have.string('<a href="/tags/def/" style="font-size: 10px;">def</a>');
    result2.should.have.string('<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>');
    result2.should.have.string('<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>');
    result2.should.have.string('<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>');
  });

  it('order', () => {
    const result = tagcloud({
      order: -1
    });

    result.should.eql([
      '<a href="/tags/def/" style="font-size: 10px;">def</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>',
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>'
    ].join(' '));
  });

  it('amount', () => {
    const result = tagcloud({
      amount: 2
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 10px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(' '));
  });

  it('transform', () => {
    const result = tagcloud({
      transform(name) {
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">ABC</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">BCD</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">CDE</a>',
      '<a href="/tags/def/" style="font-size: 10px;">DEF</a>'
    ].join(' '));
  });

  it('color: name', () => {
    const result = tagcloud({
      color: true,
      start_color: 'red',
      end_color: 'pink'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: #ff4044">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #ffc0cb">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: #ff8087">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: #f00">def</a>'
    ].join(' '));
  });

  it('color: hex', () => {
    const result = tagcloud({
      color: true,
      start_color: '#f00', // red
      end_color: '#ffc0cb' // pink
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: #ff4044">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #ffc0cb">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: #ff8087">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: #f00">def</a>'
    ].join(' '));
  });

  it('color: RGBA', () => {
    const result = tagcloud({
      color: true,
      start_color: 'rgba(70, 130, 180, 0.3)', // steelblue
      end_color: 'rgb(70, 130, 180)'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: rgba(70, 130, 180, 0.53)">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #4682b4">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: rgba(70, 130, 180, 0.77)">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: rgba(70, 130, 180, 0.3)">def</a>'
    ].join(' '));
  });

  it('color: HSLA', () => {
    const result = tagcloud({
      color: true,
      start_color: 'hsla(207, 44%, 49%, 0.3)', // rgba(70, 130, 180, 0.3)
      end_color: 'hsl(207, 44%, 49%)' // rgb(70, 130, 180)
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: rgba(70, 130, 180, 0.53)">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #4682b4">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: rgba(70, 130, 180, 0.77)">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: rgba(70, 130, 180, 0.3)">def</a>'
    ].join(' '));
  });

  it('color - when every tag has the same number of posts, start_color should be used.', () => {
    const result = tagcloud(Tag.find({
      name: /abc/
    }), {
      color: true,
      start_color: 'red',
      end_color: 'pink'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 10px; color: #f00">abc</a>'
    ].join(' '));
  });

  it('color - missing start_color', () => {
    try {
      tagcloud({
        color: true,
        end_color: 'pink'
      });
      should.fail();
    } catch (err) {
      err.message.should.eql('start_color is required!');
    }
  });

  it('separator', () => {
    const result = tagcloud({
      separator: ', '
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px;">def</a>'
    ].join(', '));
  });

  it('class name', () => {
    const result = tagcloud({
      class: 'tag-cloud'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;" class="tag-cloud-3">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;" class="tag-cloud-10">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;" class="tag-cloud-7">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px;" class="tag-cloud-0">def</a>'
    ].join(' '));
  });

  it('show_count', () => {
    const result = tagcloud({ show_count: true });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc<span class="count">2</span></a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd<span class="count">4</span></a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde<span class="count">3</span></a>',
      '<a href="/tags/def/" style="font-size: 10px;">def<span class="count">1</span></a>'
    ].join(' '));
  });

  it('show_count with custom class', () => {
    const result = tagcloud({ show_count: true, count_class: 'tag-count' });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc<span class="tag-count">2</span></a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd<span class="tag-count">4</span></a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde<span class="tag-count">3</span></a>',
      '<a href="/tags/def/" style="font-size: 10px;">def<span class="tag-count">1</span></a>'
    ].join(' '));
  });
});
