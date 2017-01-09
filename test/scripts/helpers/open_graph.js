'use strict';

var moment = require('moment');
var should = require('chai').should(); // eslint-disable-line

describe('open_graph', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var openGraph = require('../../../lib/plugins/helper/open_graph');
  var isPost = require('../../../lib/plugins/helper/is').post;
  var tag = require('hexo-util').htmlTag;
  var Post = hexo.model('Post');

  function meta(options) {
    return tag('meta', options);
  }

  before(function() {
    hexo.config.permalink = ':title';
    return hexo.init();
  });

  it('default', function() {
    Post.insert({
        source: 'foo.md',
        slug: 'bar'
      }).then(function(post) {
        return post.setTags(['optimize', 'web'])
          .thenReturn(Post.findById(post._id));
      }).then(function(post) {
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

  it('images - resolve relative path when site is hosted in subdirectory', function() {
    var urlFn = require('url');
    var config = hexo.config;
    config.url = urlFn.resolve(config.url, "blog");
    config.root = "/blog/";
    var postUrl = urlFn.resolve(config.url, "/foo/bar/index.html");

    var result = openGraph.call({
      page: {},
      config: config,
      is_post: isPost,
      url: postUrl
    }, {images: 'test.jpg'});

    result.should.contain(meta({property: 'og:image', content: urlFn.resolve(config.url, "/foo/bar/test.jpg")}));
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

  it('updated - options', function() {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { });

    result.should.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('updated - options - allow overriding og:updated_time', function() {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { updated: moment('2015-04-22T20:19:20.371Z') });

    result.should.contain(meta({property: 'og:updated_time', content: '2015-04-22T20:19:20.371Z'}));
  });

  it('updated - options - allow disabling og:updated_time', function() {
    var result = openGraph.call({
      page: { updated: moment('2016-05-23T21:20:21.372Z') },
      config: {},
      is_post: isPost
    }, { updated: false });

    result.should.not.contain(meta({property: 'og:updated_time', content: '2016-05-23T21:20:21.372Z'}));
  });

  it('description - do not add /(?:og:|twitter:)?description/ meta tags if there is no description', function() {
    var result = openGraph.call({
      page: { },
      config: {},
      is_post: isPost
    }, { });

    result.should.not.contain(meta({property: 'og:description'}));
    result.should.not.contain(meta({property: 'twitter:description'}));
    result.should.not.contain(meta({property: 'description'}));
  });

});
