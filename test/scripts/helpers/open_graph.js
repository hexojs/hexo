'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('open_graph', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var openGraph = require('../../../lib/plugins/helper/open_graph');
  var isPost = require('../../../lib/plugins/helper/is').post;
  var tag = require('hexo-util').htmlTag;

  function meta(options) {
    return tag('meta', options);
  }

  it('default', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    });

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n'));
  });

  it('title - page', function() {
    var ctx = {
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:title', content: ctx.page.title}));
  });

  it('title - options', function() {
    var result = openGraph.call({
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    }, {title: 'test'});

    result.should.contain(meta({property: 'og:title', content: 'test'}));
  });

  it('type - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {type: 'photo'});

    result.should.contain(meta({property: 'og:type', content: 'photo'}));
  });

  it('type - is_post', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: function() {
        return true;
      }
    });

    result.should.contain(meta({property: 'og:type', content: 'article'}));
  });

  it('url - context', function() {
    var ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({property: 'og:url', content: ctx.url}));
  });

  it('url - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    }, {url: 'http://hexo.io/bar'});

    result.should.contain(meta({property: 'og:url', content: 'http://hexo.io/bar'}));
  });

  it('images - content', function() {
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

  it('images - string', function() {
    var result = openGraph.call({
      page: {
        photos: 'http://hexo.io/test.jpg'
      },
      config: hexo.config,
      is_post: isPost
    });

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - array', function() {
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

  it('images - don\'t pollute context', function() {
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

  it('images - options.image', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {image: 'http://hexo.io/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - options.images', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'http://hexo.io/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: 'http://hexo.io/test.jpg'}));
  });

  it('images - prepend config.url to the path (without prefixing /)', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('images - prepend config.url to the path (with prefixing /)', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {images: '/test.jpg'});

    result.should.contain(meta({property: 'og:image', content: hexo.config.url + '/test.jpg'}));
  });

  it('site_name - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {site_name: 'foo'});

    result.should.contain(meta({property: 'og:site_name', content: 'foo'}));
  });

  it('description - page', function() {
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.description}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.description}));
  });

  it('description - options', function() {
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx, {description: 'foo'});

    result.should.contain(meta({name: 'description', content: 'foo'}));
    result.should.contain(meta({property: 'og:description', content: 'foo'}));
  });

  it('description - excerpt', function() {
    var ctx = {
      page: {excerpt: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.excerpt}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.excerpt}));
  });

  it('description - content', function() {
    var ctx = {
      page: {content: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.contain(meta({name: 'description', content: ctx.page.content}));
    result.should.contain(meta({property: 'og:description', content: ctx.page.content}));
  });

  it('description - config', function() {
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

  it('description - escape', function() {
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

  it('twitter_card - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_card: 'photo'});

    result.should.contain(meta({name: 'twitter:card', content: 'photo'}));
  });

  it('twitter_id - options (without prefixing @)', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: 'hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_id - options (with prefixing @)', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: '@hexojs'});

    result.should.contain(meta({name: 'twitter:creator', content: '@hexojs'}));
  });

  it('twitter_site - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_site: 'Hello'});

    result.should.contain(meta({name: 'twitter:site', content: 'Hello'}));
  });

  it('google_plus - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {google_plus: '+123456789'});

    result.should.contain(tag('link', {rel: 'publisher', href: '+123456789'}));
  });

  it('fb_admins - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_admins: '123456789'});

    result.should.contain(meta({property: 'fb:admins', content: '123456789'}));
  });

  it('fb_app_id - options', function() {
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_app_id: '123456789'});

    result.should.contain(meta({property: 'fb:app_id', content: '123456789'}));
  });
});
