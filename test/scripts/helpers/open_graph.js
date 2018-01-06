'use strict';

var moment = require('moment');
var should = require('chai').should(); // eslint-disable-line

describe('open_graph', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var openGraph = require('../../../lib/plugins/helper/open_graph');
  var isPost = require('../../../lib/plugins/helper/is').post;
  var tag = require('hexo-util').htmlTag;
  var Post = hexo.model('Post');

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
        meta({property: 'og:updated_time', content: post.updated.toISOString()}),
        meta({name: 'twitter:card', content: 'summary'}),
        meta({name: 'twitter:title', content: hexo.config.title})
      ].join('\n'));

      return Post.removeById(post._id);
    });
  });

  it('title - page', () => {
    var ctx = {
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:title', content: ctx.page.title}));
  });

  it('title - options', () => {
    var result = openGraph.call({
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    }, {title: 'test'});

    result.should.contain(meta({property: 'og:title', content: 'test'}));
  });

  it('type - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {type: 'photo'});

    result.should.contain(meta({property: 'og:type', content: 'photo'}));
  });

  it('type - is_post', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post() {
        return true;
      }
    });

    result.should.contain(meta({property: 'og:type', content: 'article'}));
  });

  it('url - context', () => {
    var ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:url', content: ctx.url}));
  });

  it('url - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    }, {url: 'http://hexo.io/bar'});

    result.should.contain(meta({property: 'og:url', content: 'http://hexo.io/bar'}));
  });

  it('images - content', () => {
    var result = openGraph.call({
      page: {
        content: [
          '<p>123456789</p>',
          '<img src="http://hexo.io/test.jpg">'
        ].join('')
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - string', () => {
    var result = openGraph.call({
      page: {
        photos: 'http://hexo.io/test.jpg'
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - array', () => {
    var result = openGraph.call({
      page: {
        photos: [
          'http://hexo.io/foo.jpg',
          'http://hexo.io/bar.jpg'
        ]
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain([
      meta({property: 'og:image', content: 'http://hexo.io/foo.jpg'}),
      meta({property: 'og:image', content: 'http://hexo.io/bar.jpg'})
    ].join('\n'));
  });

  it('images - don\'t pollute context', () => {
    var ctx = {
      page: {
        content: [
          '<p>123456789</p>',
          '<img src="http://hexo.io/test.jpg">'
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
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {image: 'http://hexo.io/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - options.images', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'http://hexo.io/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - prepend config.url to the path (without prefixing /)', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - prepend config.url to the path (with prefixing /)', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: '/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - resolve relative path when site is hosted in subdirectory', () => {
    var urlFn = require('url');
    var config = hexo.config;
    config.url = urlFn.resolve(config.url, 'blog');
    config.root = 'blog';
    var postUrl = urlFn.resolve(config.url, '/foo/bar/index.html');

    var result = openGraph.call({
      page: {},
      config,
      is_post: isPost,
      url: postUrl
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: urlFn.resolve(config.url, '/foo/bar/test.jpg')}));
  });

  it('site_name - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {site_name: 'foo'});

    result.should.contain(meta({property: 'og:site_name', content: 'foo'}));
  });

  it('description - page', () => {
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.description}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.description}));
  });

  it('description - options', () => {
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx, {description: 'foo'});

    result.should.contain(meta({name: 'description', content: 'foo'}));
    result.should.contain(meta({property: 'og:description', content: 'foo'}));
  });

  it('description - excerpt', () => {
    var ctx = {
      page: {excerpt: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.excerpt}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.excerpt}));
  });

  it('description - content', () => {
    var ctx = {
      page: {content: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.content}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.content}));
  });

  it('description - config', () => {
    var ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    hexo.config.description = 'test';

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: hexo.config.description}));
    result.should.contain(meta({property: 'og:description', content: hexo.config.description}));

    hexo.config.description = '';
  });

  it('description - escape', () => {
    var ctx = {
      page: {description: '<b>Important!</b> Today is "not" \'Xmas\'!'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var escaped = 'Important! Today is &quot;not&quot; &apos;Xmas&apos;!';

    result.should.contain(meta({name: 'description', content: escaped}));
    result.should.contain(meta({property: 'og:description', content: escaped}));
  });

  it('twitter_card - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_card: 'photo'});

    result.should.contain(meta({name: 'twitter:card', content: 'photo'}));
  });

  it('twitter_id - options (without prefixing @)', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: 'hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_id - options (with prefixing @)', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: '@hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_site - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_site: 'Hello'});

    result.should.contain(meta({name: 'twitter:site', content: 'Hello'}));
  });

  it('google_plus - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {google_plus: '+123456789'});

    result.should.contain(tag('link', {rel: 'publisher', href: '+123456789'}));
  });

  it('fb_admins - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_admins: '123456789'});

    result.should.contain(meta({property: 'fb:admins', content: '123456789'}));
  });

  it('fb_app_id - options', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_app_id: '123456789'});

    result.should.contain(meta({property: 'fb:app_id', content: '123456789'}));
  });

  it('updated - options', () => {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { });

    result.should.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('updated - options - allow overriding og:updated_time', () => {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { updated: moment('2015-04-22T20:19:20.371Z') });

    result.should.contain(meta({property: 'og:updated_time', content: '2015-04-22T20:19:20.371Z'}));
  });

  it('updated - options - allow disabling og:updated_time', () => {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { updated: false });

    result.should.not.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('description - do not add /(?:og:|twitter:)?description/ meta tags if there is no description', () => {
    var result = openGraph.call({
      page: { },
      config: {},
      is_post: isPost
    }, { });

    result.should.not.contain(meta({property: 'og:description'}));
    result.should.not.contain(meta({property: 'twitter:description'}));
    result.should.not.contain(meta({property: 'description'}));
  });

  it('keywords - page keywords string', () => {
    var ctx = {
      page: { keywords: 'optimize,web' },
      config: {},
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var escaped = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: escaped}));
  });

  it('keywords - page keywords array', () => {
    var ctx = {
      page: { keywords: ['optimize', 'web'] },
      config: {},
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags', () => {
    var ctx = {
      page: { tags: ['optimize', 'web'] },
      config: {},
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - config keywords string', () => {
    var ctx = {
      page: {},
      config: { keywords: 'optimize,web' },
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - config keywords array', () => {
    var ctx = {
      page: {},
      config: { keywords: ['optimize', 'web'] },
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page keywords first', () => {
    var ctx = {
      page: {
        keywords: ['web1', 'web2'],
        tags: ['web3', 'web4']
      },
      config: { keywords: 'web5,web6' },
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'web1,web2';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags second', () => {
    var ctx = {
      page: { tags: ['optimize', 'web'] },
      config: { keywords: 'web5,web6' },
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - page tags empty', () => {
    var ctx = {
      page: { tags: [] },
      config: { keywords: 'web5,web6' },
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'web5,web6';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('keywords - escape', () => {
    var ctx = {
      page: { keywords: 'optimize,web&<>"\'/,site' },
      config: {},
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var keywords = 'optimize,web&amp;&lt;&gt;&quot;&#39;&#x2F;,site';

    result.should.contain(meta({name: 'keywords', content: keywords}));
  });

  it('og:locale - options.language', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {language: 'es-cr'});

    result.should.contain(meta({property: 'og:locale', content: 'es-cr'}));
  });

  it('og:locale - page.lang', () => {
    var result = openGraph.call({
      page: { lang: 'es-mx' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-mx'}));
  });

  it('og:locale - page.language', () => {
    var result = openGraph.call({
      page: { language: 'es-gt' },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-gt'}));
  });

  it('og:locale - config.language', () => {
    hexo.config.language = 'es-pa';

    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:locale', content: 'es-pa'}));
  });

  it('og:locale - no language set', () => {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.not.contain(meta({property: 'og:locale'}));
  });
});
