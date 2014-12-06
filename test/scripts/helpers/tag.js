var should = require('chai').should();
var qs = require('querystring');
var htmlTag = require('../../../lib/util/html_tag');

describe.skip('tag', function(){
  var tag = require('../../../lib/plugins/helper/tag');
  var context = require('../../../lib/plugins/helper/url');

  describe('css', function(){
    var css = tag.css.bind(context);

    var genResult = function(arr){
      var result = '';

      arr.forEach(function(item){
        result += htmlTag('link', {rel: 'stylesheet', href: item + '.css', type: 'text/css'}) + '\n';
      });

      return result;
    };

    it('a string', function(){
      var result = genResult(['/style']);

      css('style').should.eql(result);
      css('style.css').should.eql(result);

      css('http://zespia.tw/style.css').should.eql(genResult(['http://zespia.tw/style']));
      css('//zespia.tw/style.css').should.eql(genResult(['//zespia.tw/style']));
    });

    it('an array', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      css(['foo', 'bar', 'baz']).should.eql(result);
    });

    it('multiple strings', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      css('foo', 'bar', 'baz').should.eql(result);
    });

    it('multiple arrays', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      css(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.eql(result);
    });

    it('mixed', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      css(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.eql(result);
    });
  });

  describe('js', function(){
    var js = tag.js.bind(context);

    var genResult = function(arr){
      var result = '';

      arr.forEach(function(item){
        result += htmlTag('script', {src: item + '.js', type: 'text/javascript'}, '') + '\n';
      });

      return result;
    };

    it('a string', function(){
      var result = genResult(['/script']);

      js('script').should.eql(result);
      js('script.js').should.eql(result);

      js('http://code.jquery.com/jquery-2.0.3.min.js').should.eql(genResult(['http://code.jquery.com/jquery-2.0.3.min']));
      js('//code.jquery.com/jquery-2.0.3.min.js').should.eql(genResult(['//code.jquery.com/jquery-2.0.3.min']));
    });

    it('an array', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      js(['foo', 'bar', 'baz']).should.eql(result);
    });

    it('multiple strings', function(){
      var result = genResult(['/foo', '/bar', '/baz']);

      js('foo', 'bar', 'baz').should.eql(result);
    });

    it('multiple arrays', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      js(['s1', 's2', 's3'], ['s4', 's5'], ['s6']).should.eql(result);
    });

    it('mixed', function(){
      var result = genResult(['/s1', '/s2', '/s3', '/s4', '/s5', '/s6']);

      js(['s1', 's2'], 's3', 's4', ['s5'], 's6').should.eql(result);
    });
  });

  describe('link_to', function(){
    var link_to = tag.link_to.bind(context),
      url = 'http://zespia.tw/',
      text = 'Zespia';

    it('path', function(){
      var text = url.replace(/^https?:\/\//, '');

      link_to(url).should.eql(htmlTag('a', {
        href: url,
        title: text
      }, text));
    });

    it('title', function(){
      link_to(url, text).should.eql(htmlTag('a', {
        href: url,
        title: text
      }, text));
    });

    it('external (boolean)', function(){
      link_to(url, text, true).should.eql(htmlTag('a', {
        href: url,
        title: text,
        target: '_blank',
        rel: 'external'
      }, text));
    });

    it('external (options)', function(){
      link_to(url, text, {external: true}).should.eql(htmlTag('a', {
        href: url,
        title: text,
        target: '_blank',
        rel: 'external'
      }, text));
    });

    it('class (string)', function(){
      link_to(url, text, {class: 'foo bar'}).should.eql(htmlTag('a', {
        href: url,
        title: text,
        class: 'foo bar'
      }, text));
    });

    it('class (array)', function(){
      link_to(url, text, {class: ['foo', 'bar']}).should.eql(htmlTag('a', {
        href: url,
        title: text,
        class: 'foo bar'
      }, text));
    });

    it('id', function(){
      link_to(url, text, {id: 'foo'}).should.eql(htmlTag('a', {
        href: url,
        title: text,
        id: 'foo'
      }, text));
    });
  });

  describe('mail_to', function(){
    var mail_to = tag.mail_to.bind(context),
      url = 'abc@abc.com',
      text = 'Email';

    it('path', function(){
      mail_to(url).should.eql(htmlTag('a', {
        href: 'mailto:' + url,
        title: url
      }, url));
    });

    it('text', function(){
      mail_to(url, text).should.eql(htmlTag('a', {
        href: 'mailto:' + url,
        title: text
      }, text));
    });

    it('class (string)', function(){
      mail_to(url, text, {class: 'foo bar'}).should.eql(htmlTag('a', {
        href: 'mailto:' + url,
        title: text,
        class: 'foo bar'
      }, text));
    });

    it('class (array)', function(){
      mail_to(url, text, {class: ['foo', 'bar']}).should.eql(htmlTag('a', {
        href: 'mailto:' + url,
        title: text,
        class: 'foo bar'
      }, text));
    });

    it('id', function(){
      mail_to(url, text, {id: 'foo'}).should.eql(htmlTag('a', {
        href: 'mailto:' + url,
        title: text,
        id: 'foo'
      }, text));
    });

    it('subject', function(){
      var data = {subject: 'Hello World'},
        querystring = qs.stringify(data);

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });

    it('cc (string)', function(){
      var data = {cc: 'abc@abc.com'},
        querystring = qs.stringify(data);

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });

    it('cc (array)', function(){
      var data = {cc: 'abc@abc.com,bcd@bcd.com'},
        querystring = qs.stringify(data);

      data.cc = data.cc.split(',');

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });

    it('bcc (string)', function(){
      var data = {bcc: 'abc@abc.com'},
        querystring = qs.stringify(data);

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });

    it('bcc (array)', function(){
      var data = {bcc: 'abc@abc.com,bcd@bcd.com'},
        querystring = qs.stringify(data);

      data.bcc = data.bcc.split(',');

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });

    it('body', function(){
      var data = {body: 'Lorem Ipsum'},
        querystring = qs.stringify(data);

      mail_to(url, text, data).should.eql(htmlTag('a', {
        href: 'mailto:' + url + '?' + querystring,
        title: text
      }, text));
    });
  });

  describe('image_tag', function(){
    var image_tag = tag.image_tag.bind(context),
      url = 'http://haha.com/some_img.jpg',
      text = 'An image';

    it('path', function(){
      image_tag(url).should.eql(htmlTag('img', {
        src: url
      }));
    });

    it('alt', function(){
      image_tag(url, {alt: text}).should.eql(htmlTag('img', {
        src: url,
        alt: text
      }));
    });

    it('class (string)', function(){
      image_tag(url, {class: 'foo bar'}).should.eql(htmlTag('img', {
        src: url,
        class: 'foo bar'
      }));
    });

    it('class (array)', function(){
      image_tag(url, {class: ['foo', 'bar']}).should.eql(htmlTag('img', {
        src: url,
        class: 'foo bar'
      }));
    });

    it('id', function(){
      image_tag(url, {id: 'foo'}).should.eql(htmlTag('img', {
        src: url,
        id: 'foo'
      }));
    });

    it('width', function(){
      image_tag(url, {width: 100}).should.eql(htmlTag('img', {
        src: url,
        width: 100
      }));
    });

    it('height', function(){
      image_tag(url, {height: 100}).should.eql(htmlTag('img', {
        src: url,
        height: 100
      }));
    });
  });

  describe('favicon_tag', function(){
    var favicon_tag = tag.favicon_tag.bind(context),
      path = '/favicon.ico';

    it('path', function(){
      favicon_tag(path).should.eql(htmlTag('link', {
        rel: 'shortcut icon',
        href: path
      }));
    });
  });

  describe('feed_tag', function(){
    var feed_tag = tag.feed_tag.bind(context),
      url = '/atom.xml',
      text = 'Feed Title';

    var attrs = {
      rel: 'alternative',
      href: url,
      title: '',
      type: 'application/atom+xml'
    };

    it('path', function(){
      attrs.title = 'Hello world';
      feed_tag(url).should.eql(htmlTag('link', attrs));
    });

    it('title', function(){
      attrs.title = 'Hello world';
      feed_tag(url, {title: text}).should.eql(htmlTag('link', attrs));
    });

    it('type', function(){
      attrs.title = 'Hello world';
      attrs.type = 'application/rss+xml';

      feed_tag(url, {type: 'rss'}).should.eql(htmlTag('link', attrs));
    });
  });
});