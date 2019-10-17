'use strict';

const moment = require('moment');
const cheerio = require('cheerio');

describe('open_graph', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const openGraph = require('../../../lib/plugins/helper/open_graph');
  const isPost = require('../../../lib/plugins/helper/is').post;
  const tag = require('hexo-util').htmlTag;
  const Post = hexo.model('Post');

  function meta(options) {
    return tag('meta', options);
  }

  before(() => {
    hexo.config.permalink = ':title';
    return hexo.init();
  });

  it('default', () => {
    Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(post => post.setTags(['optimize', 'web'])
      .thenReturn(Post.findById(post._id))).then(post => {
      openGraph.call({
        page: post,
        config: hexo.config,
        is_post: isPost
      }).should.eql([
        meta({name: 'keywords', content: 'optimize,web'}),
        meta({property: 'og:type', content: 'website'}),
        meta({property: 'og:title', content: hexo.config.title}),
        meta({property: 'og:url'}),
        meta({property: 'og:site_name', content: hexo.config.title}),
        meta({property: 'og:locale', content: 'en'}),
        meta({property: 'article:published_time', content: post.date.toISOString()}),
        meta({property: 'article:modified_time', content: post.updated.toISOString()}),
        meta({name: 'twitter:card', content: 'summary'})
      ].join('\n'));

      return Post.removeById(post._id);
    });
  });

  it('title - page', () => {
    const ctx = {
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:title', content: ctx.page.title}));
  });

  it('title - options', () => {
    const result = openGraph.call({
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    }, {title: 'test'});

    result.should.contain(meta({property: 'og:title', content: 'test'}));
  });

  it('type - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {type: 'photo'});

    result.should.contain(meta({property: 'og:type', content: 'photo'}));
  });

  it('type - is_post', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post() {
        return true;
      }
    });

    result.should.contain(meta({property: 'og:type', content: 'article'}));
  });

  it('url - context', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://hexo.io/foo'
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:url', content: ctx.url}));
  });

  it('url - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://hexo.io/foo'
    }, {url: 'https://hexo.io/bar'});

    result.should.contain(meta({property: 'og:url', content: 'https://hexo.io/bar'}));
  });

  it('url - should not ends with index.html', () => {
    hexo.config.pretty_urls.trailing_index = false;
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://yoursite.com/page/index.html'
    });

    const $ = cheerio.load(result);

    $('meta[property="og:url"]').attr('content').endsWith('index.html').should.be.false;

    hexo.config.pretty_urls.trailing_index = true;
  });

  it('url - IDN', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'https://foô.com/bár'
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:url', content: 'https://xn--fo-9ja.com/b%C3%A1r'}));
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

    result.should.contain(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - string', () => {
    const result = openGraph.call({
      page: {
        photos: 'https://hexo.io/test.jpg'
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
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

    result.should.contain([
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

    result.should.contain(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - options.images', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'https://hexo.io/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: 'https://hexo.io/test.jpg'}));
  });

  it('images - prepend config.url to the path (without prefixing /)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - prepend config.url to the path (with prefixing /)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: '/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - resolve relative path when site is hosted in subdirectory', () => {
    const urlFn = require('url');
    const config = hexo.config;
    config.url = urlFn.resolve(config.url, 'blog');
    config.root = 'blog';
    const postUrl = urlFn.resolve(config.url, '/foo/bar/index.html');

    const result = openGraph.call({
      page: {},
      config,
      is_post: isPost,
      url: postUrl
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: urlFn.resolve(config.url, '/foo/bar/test.jpg')}));
  });

  it('site_name - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {site_name: 'foo'});

    result.should.contain(meta({property: 'og:site_name', content: 'foo'}));
  });

  it('description - page', () => {
    const ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.description}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.description}));
  });

  it('description - options', () => {
    const ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx, {description: 'foo'});

    result.should.contain(meta({name: 'description', content: 'foo'}));
    result.should.contain(meta({property: 'og:description', content: 'foo'}));
  });

  it('description - excerpt', () => {
    const ctx = {
      page: {excerpt: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.excerpt}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.excerpt}));
  });

  it('description - content', () => {
    const ctx = {
      page: {content: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.content}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.content}));
  });

  it('description - config', () => {
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    hexo.config.description = 'test';

    const result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: hexo.config.description}));
    result.should.contain(meta({property: 'og:description', content: hexo.config.description}));

    hexo.config.description = '';
  });

  it('description - escape', () => {
    const ctx = {
      page: {description: '<b>Important!</b> Today is "not" \'Xmas\'!'},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const escaped = 'Important! Today is &quot;not&quot; &apos;Xmas&apos;!';

    result.should.contain(meta({name: 'description', content: escaped}));
    result.should.contain(meta({property: 'og:description', content: escaped}));
  });

  it('twitter_card - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_card: 'photo'});

    result.should.contain(meta({name: 'twitter:card', content: 'photo'}));
  });

  it('twitter_id - options (without prefixing @)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: 'hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_id - options (with prefixing @)', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: '@hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_site - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_site: 'Hello'});

    result.should.contain(meta({name: 'twitter:site', content: 'Hello'}));
  });

  it('google_plus - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {google_plus: '+123456789'});

    result.should.contain(tag('link', {rel: 'publisher', href: '+123456789'}));
  });

  it('fb_admins - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_admins: '123456789'});

    result.should.contain(meta({property: 'fb:admins', content: '123456789'}));
  });

  it('fb_app_id - options', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_app_id: '123456789'});

    result.should.contain(meta({property: 'fb:app_id', content: '123456789'}));
  });

  it('updated - options', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { });

    result.should.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('updated - options - allow overriding og:updated_time', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { updated: moment('2015-04-22T20:19:20.371Z') });

    result.should.contain(meta({property: 'og:updated_time', content: '2015-04-22T20:19:20.371Z'}));
  });

  it('updated - options - allow disabling og:updated_time', () => {
    const result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: hexo.config,
      is_post: isPost
    }, { updated: false });

    result.should.not.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('description - do not add /(?:og:)?description/ meta tags if there is no description', () => {
    const result = openGraph.call({
      page: { },
      config: hexo.config,
      is_post: isPost
    }, { });

    result.should.not.contain(meta({property: 'og:description'}));
    result.should.not.contain(meta({property: 'description'}));
  });

  it('keywords - page keywords string', () => {
    const ctx = {
      page: { keywords: 'optimize,web' },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const escaped = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: escaped}));
  });

  it('keywords - page keywords array', () => {
    const ctx = {
      page: { keywords: ['optimize', 'web'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags', () => {
    const ctx = {
      page: { tags: ['optimize', 'web'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - config keywords string', () => {
    hexo.config.keywords = 'optimize,web';
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - config keywords array', () => {
    hexo.config.keywords = ['optimize', 'web'];
    const ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page keywords first', () => {
    hexo.config.keywords = 'web5,web6';
    const ctx = {
      page: {
        keywords: ['web1', 'web2'],
        tags: ['web3', 'web4']
      },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'web1,web2';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags second', () => {
    hexo.config.keywords = 'web5,web6';
    const ctx = {
      page: { tags: ['optimize', 'web'] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags empty', () => {
    hexo.config.keywords = 'web5,web6';
    const ctx = {
      page: { tags: [] },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'web5,web6';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - escape', () => {
    const ctx = {
      page: { keywords: 'optimize,web&<>"\'/,site' },
      config: hexo.config,
      is_post: isPost
    };

    const result = openGraph.call(ctx);
    const keywords = 'optimize,web&amp;&lt;&gt;&quot;&#39;&#x2F;,site';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('og:locale - options.language', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {language: 'es-cr'});

    result.should.contain(meta({property: 'og:locale', content: 'es-cr'}));
  });

  it('og:locale - page.lang', () => {
    const result = openGraph.call({
      page: { lang: 'es-mx' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-mx'}));
  });

  it('og:locale - page.language', () => {
    const result = openGraph.call({
      page: { language: 'es-gt' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-gt'}));
  });

  it('og:locale - config.language', () => {
    hexo.config.language = 'es-pa';

    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-pa'}));
  });

  it('og:locale - no language set', () => {
    const result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.not.contain(meta({property: 'og:locale'}));
  });
});
