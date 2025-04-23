import moment from 'moment';
import * as cheerio from 'cheerio';
import { encodeURL, htmlTag as tag } from 'hexo-util';
import defaultConfig from '../../../lib/hexo/default_config';
import Hexo from '../../../lib/hexo';
import openGraph from '../../../lib/plugins/helper/open_graph';
import { post as isPost } from '../../../lib/plugins/helper/is';

describe('open_graph', () => {
  const hexo = new Hexo();
  const Post = hexo.model('Post');

  function meta(options) {
    return tag('meta', options);
  }

  before(() => {
    return hexo.init();
  });

  beforeEach(() => {
    // Reset config
    hexo.config = { ...defaultConfig };
    hexo.config.permalink = ':title';
  });

  it('default', async () => {
    let post = await Post.insert({
      source: 'foo.md',
      slug: 'bar'
    });
    await post.setTags(['optimize', 'web']);

    post = await Post.findById(post._id);

    const result = openGraph.call({
      page: post,
      config: hexo.config,
      is_post: isPost
    });

    result.should.eql([
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:locale', content: 'en_US'}),
      meta({property: 'article:published_time', content: post.date.toISOString()}),
      // page.updated will no longer exist by default
      // See https://github.com/hexojs/hexo/pull/4278
      // meta({property: 'article:modified_time', content: post.updated.toISOString()}),
      meta({property: 'article:author', content: hexo.config.author}),
      meta({property: 'article:tag', content: 'optimize'}),
      meta({property: 'article:tag', content: 'web'}),
      meta({name: 'twitter:card', content: 'summary'})
    ].join('\n'));

    await Post.removeById(post._id);
  });

  it('title - page', () => {
    const ctx = {
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({property: 'og:title', content: ctx.page.title}));
  });

  it('title - options', () => {
    const result = openGraph.call({
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    }, {title: 'test'});

    result.should.have.string(meta({property: 'og:title', content: 'test'}));
  });

  it('type - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {type: 'photo'});

    result.should.have.string(meta({property: 'og:type', content: 'photo'}));
  });

  it('type - is_post', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post() {
        return true;
      }
    });

    result.should.have.string(meta({property: 'og:type', content: 'article'}));
  });

  it('url - context', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://hexo.io/foo'
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({property: 'og:url', content: ctx.url}));
  });

  it('url - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://hexo.io/foo'
    }, {url: 'https://hexo.io/bar'});

    result.should.have.string(meta({property: 'og:url', content: 'https://hexo.io/bar'}));
  });

  it('url - pretty_urls.trailing_index', () => {
    hexo.config.pretty_urls.trailing_index = false;
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://example.com/page/index.html'
    });

    const $ = cheerio.load(result);

    $('meta[property="og:url"]').attr('content')!.endsWith('index.html').should.be.false;

    hexo.config.pretty_urls.trailing_index = true;
  });

  it('url - pretty_urls.trailing_html', () => {
    hexo.config.pretty_urls.trailing_html = false;
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://example.com/page/about.html'
    });

    const $ = cheerio.load(result);

    $('meta[property="og:url"]').attr('content')!.endsWith('.html').should.be.false;

    hexo.config.pretty_urls.trailing_html = true;
  });

  it('url - null pretty_urls', () => {
    hexo.config.pretty_urls = null as any;
    const url = 'http://example.com/page/about.html';
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url
    });

    const $ = cheerio.load(result);

    $('meta[property="og:url"]').attr('content')!.should.eql(url);

    hexo.config.pretty_urls = {
      trailing_index: true,
      trailing_html: true
    };
  });

  it('url - IDN', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://foô.com/bár'
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({property: 'og:url', content: encodeURL(ctx.url)}));
  });

  it('images - content', () => {
    const result = openGraph.call({
      page: {
        content: [
          '<p>123456789</p>',
          '<img src="https://hexo.io/test.jpg">',
          '<img src="">',
          '<img class="img">'
        ].join('')
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - content with data-uri', () => {
    const result = openGraph.call({
      page: {
        content: '<img src="data:image/svg+xml;utf8,<svg>...</svg>">'
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.not.have.string(meta({property: 'og:image', content: 'data:image/svg+xml;utf8,<svg>...</svg>'}));
  });

  it('images - string', () => {
    const result = openGraph.call({
      page: {
        photos: 'https://hexo.io/test.jpg'
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - array', () => {
    const result = openGraph.call({
      page: {
        photos: [
          'https://hexo.io/foo.jpg',
          'https://hexo.io/bar.jpg'
        ]
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string([
      meta({property: 'og:image', content: 'https://hexo.io/foo.jpg'}),
      meta({property: 'og:image', content: 'https://hexo.io/bar.jpg'})
    ].join('\n'));
  });

  it('images - don\'t pollute context', () => {
    const ctx = {
      page: {
        content: [
          '<p>123456789</p>',
          '<img src="https://hexo.io/test.jpg">',
          '<img src="">',
          '<img class="img">'
        ].join(''),
        photos: []
      },
      config: hexo.config,
      is_post: isPost
    };

    openGraph.call(ctx);
    ctx.page.photos.should.eql([]);
  });

  it('images - options.image', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {image: 'https://hexo.io/test.jpg'});

    result.should.have.string(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - options.images', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'https://hexo.io/test.jpg'});

    result.should.have.string(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - prepend config.url to the path (without prefixing /)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'test.jpg'});

    result.should.have.string(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - prepend config.url to the path (with prefixing /)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: '/test.jpg'});

    result.should.have.string(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - resolve relative path when site is hosted in subdirectory', () => {
    const config = hexo.config;
    config.url = new URL('blog', config.url).toString();
    config.root = 'blog';
    const postUrl = new URL('/foo/bar/index.html', config.url).toString();

    const result = openGraph.call({
      page: {},
      config,
      is_post: isPost,
      url: postUrl
    }, {images: 'test.jpg'});

    result.should.have.string(meta({property: 'og:image', content: new URL('/foo/bar/test.jpg', config.url).toString()}));
  });

  it('twitter_image - default same as og:image', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'image.jpg'});

    result.should.have.string(meta({name: 'twitter:image', content: hexo.config.url + '/image.jpg'}));
  });

  it('twitter_image - different URLs for og:image and twitter:image', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_image: 'twitter.jpg', images: 'image.jpg'});

    result.should.have.string(meta({name: 'twitter:image', content: hexo.config.url + '/twitter.jpg'}));
  });

  it('images - twitter_image absolute url', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_image: 'https://hexo.io/twitter.jpg', images: 'image.jpg'});

    result.should.have.string(meta({name: 'twitter:image', content: 'https://hexo.io/twitter.jpg'}));
  });

  it('site_name - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {site_name: 'foo'});

    result.should.have.string(meta({property: 'og:site_name', content: 'foo'}));
  });

  it('description - page', () => {
    const ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({name: 'description', content: ctx.page.description}));
    result.should.have.string(meta({property: 'og:description', content: ctx.page.description}));
  });

  it('description - options', () => {
    const ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx, {description: 'foo'});

    result.should.have.string(meta({name: 'description', content: 'foo'}));
    result.should.have.string(meta({property: 'og:description', content: 'foo'}));
  });

  it('description - excerpt', () => {
    const ctx = {
      page: {excerpt: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({name: 'description', content: ctx.page.excerpt}));
    result.should.have.string(meta({property: 'og:description', content: ctx.page.excerpt}));
  });

  it('description - content', () => {
    const ctx = {
      page: {content: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.have.string(meta({name: 'description', content: ctx.page.content}));
    result.should.have.string(meta({property: 'og:description', content: ctx.page.content}));
  });

  it('description - config', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    hexo.config.description = 'test';

    const result = openGraph.call(ctx);

    result.should.have.string(meta({name: 'description', content: hexo.config.description}));
    result.should.have.string(meta({property: 'og:description', content: hexo.config.description}));

    hexo.config.description = '';
  });

  it('description - escape', () => {
    const ctx = {
      page: {description: '<b>Important!</b> Today is "not" \'Xmas\'!'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const escaped = 'Important! Today is &quot;not&quot; &#39;Xmas&#39;!';

    result.should.have.string(meta({name: 'description', content: escaped}));
    result.should.have.string(meta({property: 'og:description', content: escaped}));
  });

  it('twitter_card - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_card: 'photo'});

    result.should.have.string(meta({name: 'twitter:card', content: 'photo'}));
  });

  it('twitter_id - options (without prefixing @)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: 'hexojs'});

    result.should.have.string(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_id - options (with prefixing @)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: '@hexojs'});

    result.should.have.string(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_site - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_site: 'Hello'});

    result.should.have.string(meta({name: 'twitter:site', content: 'Hello'}));
  });

  it('fb_admins - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_admins: '123456789'});

    result.should.have.string(meta({property: 'fb:admins', content: '123456789'}));
  });

  it('fb_app_id - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_app_id: '123456789'});

    result.should.have.string(meta({property: 'fb:app_id', content: '123456789'}));
  });

  it('updated - options', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { });

    result.should.have.string(meta({property: 'article:modified_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('updated - options - allow overriding article:modified_time', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { updated: moment('2015-04-22T20:19:20.371Z') });

    result.should.have.string(meta({property: 'article:modified_time', content: '2015-04-22T20:19:20.371Z'}));
  });

  it('updated - options - allow disabling article:modified_time', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { updated: false });

    result.should.not.have.string(meta({property: 'article:modified_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('description - do not add /(?:og:)?description/ meta tags if there is no description', () => {
    const result = openGraph.call({
      page: { },
      config: hexo.config,
      is_post: isPost
    }, { });

    result.should.not.have.string(meta({property: 'og:description'}));
    result.should.not.have.string(meta({property: 'description'}));
  });

  it('keywords - page keywords array', () => {
    const ctx = {
      page: { tags: ['optimize', 'web'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['optimize', 'web'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
  });

  it('keywords - page keywords string', () => {
    const ctx = {
      page: { tags: 'optimize' },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['optimize'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
  });

  it('keywords - page tags', () => {
    const ctx = {
      page: { tags: ['optimize', 'web'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['optimize', 'web'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
  });

  // https://github.com/hexojs/hexo/issues/5458
  it('keywords - page tags sorted', () => {
    const ctx = {
      page: { tags: ['web', 'optimize'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['web', 'optimize'].sort();

    result.should.have.string(meta({ property: 'article:tag', content: keywords[0] }) + '\n' + meta({ property: 'article:tag', content: keywords[1] }));
  });

  it('keywords - config keywords array', () => {
    hexo.config.keywords = ['optimize', 'web'];
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['optimize', 'web'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
  });

  it('keywords - page tags first', () => {
    hexo.config.keywords = ['web3', 'web4'];
    const ctx = {
      page: {
        tags: ['web1', 'web2']
      },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['web1', 'web2'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
  });

  it('keywords - use config.keywords if no tags', () => {
    hexo.config.keywords = ['web5', 'web6'];
    const ctx = {
      page: { tags: [] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['web5', 'web6'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
  });

  it('keywords - null', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.not.have.string('<meta property="article:tag"');
  });

  it('keywords - escape', () => {
    const ctx = {
      page: { tags: ['optimize', 'web&<>"\'/', 'site'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = ['optimize', 'web&<>"\'/', 'site'];

    result.should.have.string(meta({property: 'article:tag', content: keywords[0]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[1]}));
    result.should.have.string(meta({property: 'article:tag', content: keywords[2]}));
  });

  it('og:locale - options.language', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {language: 'es-cr'});

    result.should.have.string(meta({property: 'og:locale', content: 'es_CR'}));
  });

  it('og:locale - options.language (incorrect format)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {language: 'foo-bar'});

    result.should.have.string(meta({property: 'og:locale', content: undefined}));
  });

  it('og:locale - page.lang', () => {
    const result = openGraph.call({
      page: { lang: 'es-mx' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:locale', content: 'es_MX'}));
  });

  it('og:locale - page.language', () => {
    const result = openGraph.call({
      page: { language: 'es-gt' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:locale', content: 'es_GT'}));
  });

  it('og:locale - config.language', () => {
    hexo.config.language = 'es-pa';

    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:locale', content: 'es_PA'}));
  });

  it('og:locale - convert territory to uppercase', () => {
    hexo.config.language = 'fr-fr';

    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'og:locale', content: 'fr_FR'}));
  });

  it('og:locale - no language set', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.not.have.string(meta({property: 'og:locale'}));
  });

  it('og:locale - language is not in lang-TERRITORY format', () => {
    hexo.config.language = 'en';
    openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }).should.have.string(meta({property: 'og:locale', content: 'en_US'}));

    hexo.config.language = 'Fr_fr';
    openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }).should.have.string(meta({property: 'og:locale', content: 'fr_FR'}));

    hexo.config.language = 'zh-CN';
    openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }).should.have.string(meta({property: 'og:locale', content: 'zh_CN'}));
  });

  it('article:author - options.author', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {author: 'Jane Doe'});

    result.should.have.string(meta({property: 'article:author', content: 'Jane Doe'}));
  });

  it('article:author - config.language', () => {
    hexo.config.language = 'es-pa';

    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.have.string(meta({property: 'article:author', content: 'John Doe'}));
  });

  it('article:author - no author set', () => {
    const result = openGraph.call({
      page: {},
      config: { author: undefined },
      is_post: isPost
    });

    result.should.not.have.string(meta({property: 'article:author'}));
  });
});
