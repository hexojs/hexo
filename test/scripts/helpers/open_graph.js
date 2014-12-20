var should = require('chai').should();

describe('open_graph', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var openGraph = require('../../../lib/plugins/helper/open_graph');
  var isPost = require('../../../lib/plugins/helper/is').is_post;
  var tag = require('hexo-util').htmlTag;

  function meta(options){
    return tag('meta', options);
  }

  it('default', function(){
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
    ].join('\n') + '\n');
  });

  it('title - page', function(){
    var ctx = {
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: ctx.page.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: ctx.page.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('title - options', function(){
    var result = openGraph.call({
      page: {title: 'Hello world'},
      config: hexo.config,
      is_post: isPost
    }, {title: 'test'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: 'test'}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: 'test'}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('type - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {type: 'photo'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'photo'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('type - is_post', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: function(){ return true; }
    });

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'article'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('url - context', function(){
    var ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    };

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url', content: ctx.url}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('url - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost,
      url: 'http://hexo.io/foo'
    }, {url: 'http://hexo.io/bar'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url', content: 'http://hexo.io/bar'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it.skip('images - page', function(){
    //
  });

  it.skip('images - options', function(){
    //
  });

  it('site_name - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {site_name: 'foo'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: 'foo'}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('description - page', function(){
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description', content: ctx.page.description}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: ctx.page.description}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: ctx.page.description})
    ].join('\n') + '\n');
  });

  it('description - options', function(){
    var ctx = {
      page: {description: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx, {description: 'foo'});

    result.should.eql([
      meta({name: 'description', content: 'foo'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: 'foo'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: 'foo'})
    ].join('\n') + '\n');
  });

  it('description - excerpt', function(){
    var ctx = {
      page: {excerpt: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description', content: ctx.page.excerpt}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: ctx.page.excerpt}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: ctx.page.excerpt})
    ].join('\n') + '\n');
  });

  it('description - content', function(){
    var ctx = {
      page: {content: 'test'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description', content: ctx.page.content}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: ctx.page.content}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: ctx.page.content})
    ].join('\n') + '\n');
  });

  it('description - config', function(){
    var ctx = {
      page: {},
      config: hexo.config,
      is_post: isPost
    };

    hexo.config.description = 'test';

    var result = openGraph.call(ctx);

    result.should.eql([
      meta({name: 'description', content: hexo.config.description}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: hexo.config.description}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: hexo.config.description})
    ].join('\n') + '\n');

    hexo.config.description = '';
  });

  it('description - escape', function(){
    var ctx = {
      page: {description: '<b>Important!</b> Today is "not" \'Xmas\'!'},
      config: hexo.config,
      is_post: isPost
    };

    var result = openGraph.call(ctx);
    var escaped = 'Important! Today is &quot;not&quot; &apos;Xmas&apos;!';

    result.should.eql([
      meta({name: 'description', content: escaped}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description', content: escaped}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description', content: escaped})
    ].join('\n') + '\n');
  });

  it('twitter_card - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_card: 'photo'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'photo'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'})
    ].join('\n') + '\n');
  });

  it('twitter_id - options (without prefixing @)', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: 'hexojs'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      meta({name: 'twitter:creator', content: '@hexojs'})
    ].join('\n') + '\n');
  });

  it('twitter_id - options (with prefixing @)', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_id: '@hexojs'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      meta({name: 'twitter:creator', content: '@hexojs'})
    ].join('\n') + '\n');
  });

  it('twitter_site - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {twitter_site: 'Hello'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      meta({name: 'twitter:site', content: 'Hello'})
    ].join('\n') + '\n');
  });

  it('google_plus - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {google_plus: '+123456789'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      tag('link', {rel: 'publisher', href: '+123456789'})
    ].join('\n') + '\n');
  });

  it('fb_admins - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_admins: '123456789'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      meta({property: 'fb:admins', content: '123456789'})
    ].join('\n') + '\n');
  });

  it('fb_app_id - options', function(){
    var result = openGraph.call({
      page: {},
      config: hexo.config,
      is_post: isPost
    }, {fb_app_id: '123456789'});

    result.should.eql([
      meta({name: 'description'}),
      meta({property: 'og:type', content: 'website'}),
      meta({property: 'og:title', content: hexo.config.title}),
      meta({property: 'og:url'}),
      meta({property: 'og:site_name', content: hexo.config.title}),
      meta({property: 'og:description'}),
      meta({name: 'twitter:card', content: 'summary'}),
      meta({name: 'twitter:title', content: hexo.config.title}),
      meta({name: 'twitter:description'}),
      meta({property: 'fb:app_id', content: '123456789'})
    ].join('\n') + '\n');
  });
});