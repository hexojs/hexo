var should = require('should'),
  cheerio = require('cheerio'),
  marked = require('marked'),
  path = require('path'),
  util = require('../lib/util'),
  file = util.file2,
  highlight = util.highlight;

describe('Tags', function(){
  describe('blockquote', function(){
    var blockquote = require('../lib/plugins/tag/blockquote');

    var raw = '123456 **bold** and *italic*',
      parsed = marked(raw);

    it('content', function(){
      var $ = cheerio.load(blockquote([], raw));

      $('blockquote').html().should.be.eql(parsed);
    });

    it('author', function(){
      var $ = cheerio.load(blockquote('John Doe'.split(' '), raw));

      $('blockquote footer strong').html().should.be.eql('John Doe');
    });

    it('author + source', function(){
      var $ = cheerio.load(blockquote('John Doe, A book'.split(' '), raw));

      $('blockquote footer strong').html().should.be.eql('John Doe');
      $('blockquote footer cite').html().should.be.eql('a Book');
    });

    it('author + link', function(){
      var $ = cheerio.load(blockquote('John Doe http://zespia.tw'.split(' '), raw));

      $('blockquote footer strong').html().should.be.eql('John Doe');
      $('blockquote footer cite').html().should.be.eql('<a href="http://zespia.tw">zespia.tw/</a>');

      var $ = cheerio.load(blockquote('John Doe http://zespia.tw/this/is/a/fucking/long/url'.split(' '), raw));

      $('blockquote footer strong').html().should.be.eql('John Doe');
      $('blockquote footer cite').html().should.be.eql('<a href="http://zespia.tw/this/is/a/fucking/long/url">zespia.tw/this/is/a/fucking/&hellip;</a>');
    });

    it('author + link + title', function(){
      var $ = cheerio.load(blockquote('John Doe http://zespia.tw My Blog'.split(' '), raw));

      $('blockquote footer strong').html().should.be.eql('John Doe');
      $('blockquote footer cite').html().should.be.eql('<a href="http://zespia.tw">My Blog</a>')
    });
  });

  describe('code', function(){
    var code = require('../lib/plugins/tag/code');

    var dummy = [
      'var dummy = function(){',
      '  alert("dummy");',
      '});'
    ].join('\n');

    var content =  cheerio.load(highlight(dummy))('table').html();

    it('content', function(){
      var $ = cheerio.load(code([], dummy));

      $('figure').attr('class').should.be.eql('highlight');
      $('figure table').html().should.be.eql(content);
    });

    it('lang', function(){
      var $ = cheerio.load(code('lang:js'.split(' '), ''));

      $('figure').attr('class').should.be.eql('highlight lang-js');
    });

    it('title', function(){
      var $ = cheerio.load(code('Code block test'.split(' '), ''));

      $('figcaption span').html().should.be.eql('Code block test');
    });

    it('title + url', function(){
      var $ = cheerio.load(code('Code block test http://zespia.tw'.split(' '), ''));

      $('figcaption span').html().should.be.eql('Code block test');
      $('figcaption a').attr('href').should.be.eql('http://zespia.tw');
      $('figcaption a').html().should.be.eql('link');
    });

    it('title + url + link', function(){
      var $ = cheerio.load(code('Code block test http://zespia.tw My blog'.split(' '), ''));

      $('figcaption span').html().should.be.eql('Code block test');
      $('figcaption a').attr('href').should.be.eql('http://zespia.tw');
      $('figcaption a').html().should.be.eql('My blog');
    });
  });

  describe('gist', function(){
    var gist = require('../lib/plugins/tag/gist');

    it('id', function(){
      var $ = cheerio.load(gist(['foo']));

      $('script').attr('src').should.be.eql('https://gist.github.com/foo.js');
    });

    it('file', function(){
      var $ = cheerio.load(gist(['foo', 'bar']));

      $('script').attr('src').should.be.eql('https://gist.github.com/foo.js?file=bar');
    })
  });

  describe('iframe', function(){
    var iframe = require('../lib/plugins/tag/iframe');

    it('url', function(){
      var $ = cheerio.load(iframe(['http://zespia.tw']));

      $('iframe').attr('src').should.be.eql('http://zespia.tw');
      $('iframe').attr('width').should.be.eql('100%');
      $('iframe').attr('height').should.be.eql('300');
      $('iframe').attr('frameborder').should.be.eql('0');
      $('iframe').attr('allowfullscreen').should.be.eql('');
    });

    it('width', function(){
      var $ = cheerio.load(iframe(['http://zespia.tw', '500']));

      $('iframe').attr('src').should.be.eql('http://zespia.tw');
      $('iframe').attr('width').should.be.eql('500');
      $('iframe').attr('height').should.be.eql('300');
      $('iframe').attr('frameborder').should.be.eql('0');
      $('iframe').attr('allowfullscreen').should.be.eql('');
    });

    it('height', function(){
      var $ = cheerio.load(iframe(['http://zespia.tw', '500', '600']));

      $('iframe').attr('src').should.be.eql('http://zespia.tw');
      $('iframe').attr('width').should.be.eql('500');
      $('iframe').attr('height').should.be.eql('600');
      $('iframe').attr('frameborder').should.be.eql('0');
      $('iframe').attr('allowfullscreen').should.be.eql('');
    });
  });

  describe('img', function(){
    var img = require('../lib/plugins/tag/img');

    it('src', function(){
      var $ = cheerio.load(img(['http://placekitten.com/200/300']));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
    });

    it('class + src', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
    });

    it('multiple classes + src', function(){
      var $ = cheerio.load(img('left top http://placekitten.com/200/300'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left top');
    });

    it('class + src + width', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 200'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('width').should.be.eql('200');
    });

    it('class + src + width + height', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('width').should.be.eql('200');
      $('img').attr('height').should.be.eql('300');
    });

    it('class + src + title', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 Place Kitten'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('title').should.be.eql('Place Kitten');
    });

    it('class + src + width + title', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 200 Place Kitten'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('width').should.be.eql('200');
      $('img').attr('title').should.be.eql('Place Kitten');
    });

    it('class + src + width + height + title', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 Place Kitten'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('width').should.be.eql('200');
      $('img').attr('height').should.be.eql('300');
      $('img').attr('title').should.be.eql('Place Kitten');
    });

    it('class + src + width + height + title + alt', function(){
      var $ = cheerio.load(img('left http://placekitten.com/200/300 200 300 "Place Kitten" "A cute kitten"'.split(' ')));

      $('img').attr('src').should.be.eql('http://placekitten.com/200/300');
      $('img').attr('class').should.be.eql('left');
      $('img').attr('width').should.be.eql('200');
      $('img').attr('height').should.be.eql('300');
      $('img').attr('title').should.be.eql('Place Kitten');
      $('img').attr('alt').should.be.eql('A cute kitten');
    });
  });

  describe('include_code', function(){
    var include_code = require('../lib/plugins/tag/include_code'),
      content = '';

    before(function(done){
      file.readFile(path.join(__dirname, 'blog', 'source', 'downloads', 'code', 'test.js'), function(err, result){
        if (err) throw err;

        content = cheerio.load(highlight(result))('table').html();
        done();
      });
    });

    it('file', function(){
      var $ = cheerio.load(include_code('test.js'.split(' ')));

      $('figure').attr('class').should.be.eql('highlight lang-js');
      $('figure table').html().should.be.eql(content);
    });

    it('title', function(){
      var $ = cheerio.load(include_code('Code block title test.js'.split(' ')));

      $('figcaption span').html().should.be.eql('Code block title');
    });

    it('lang', function(){
      var $ = cheerio.load(include_code('lang:javascript test.js'.split(' ')));

      $('figure').attr('class').should.be.eql('highlight lang-javascript');
    });
  });

  describe('jsfiddle', function(){
    var jsfiddle = require('../lib/plugins/tag/jsfiddle');

    it('id', function(){
      var $ = cheerio.load(jsfiddle(['foo']));

      $('iframe').attr('src').should.be.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');
    });

    it('tabs', function(){
      var $ = cheerio.load(jsfiddle(['foo', 'default']));

      $('iframe').attr('src').should.be.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');

      var $ = cheerio.load(jsfiddle(['foo', 'html,css']));

      $('iframe').attr('src').should.be.eql('http://jsfiddle.net/foo/embedded/html,css/light');
    });

    it('skin', function(){
      var $ = cheerio.load(jsfiddle(['foo', 'default', 'default']));

      $('iframe').attr('src').should.be.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/light');

      var $ = cheerio.load(jsfiddle(['foo', 'default', 'dark']));

      $('iframe').attr('src').should.be.eql('http://jsfiddle.net/foo/embedded/js,resources,html,css,result/dark');
    });

    it('width', function(){
      var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default']));

      $('iframe').attr('width').should.be.eql('100%');

      var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', '500']));

      $('iframe').attr('width').should.be.eql('500');
    });

    it('height', function(){
      var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default', 'default']));

      $('iframe').attr('height').should.be.eql('300');

      var $ = cheerio.load(jsfiddle(['foo', 'default', 'default', 'default', '500']));

      $('iframe').attr('height').should.be.eql('500');
    });
  });

  describe('link', function(){
    var link = require('../lib/plugins/tag/link');

    it('text + url', function(){
      var $ = cheerio.load(link('Click here to Google http://google.com'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
    });

    it('text + url + external', function(){
      var $ = cheerio.load(link('Click here to Google http://google.com true'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
      $('a').attr('target').should.be.eql('_blank');

      var $ = cheerio.load(link('Click here to Google http://google.com false'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
      should.not.exist($('a').attr('target'));
    });

    it('text + url + title', function(){
      var $ = cheerio.load(link('Click here to Google http://google.com Google link'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
      $('a').attr('title').should.be.eql('Google link');
    });

    it('text + url + external + title', function(){
      var $ = cheerio.load(link('Click here to Google http://google.com true Google link'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
      $('a').attr('target').should.be.eql('_blank');
      $('a').attr('title').should.be.eql('Google link');

      var $ = cheerio.load(link('Click here to Google http://google.com false Google link'.split(' ')));

      $('a').attr('href').should.be.eql('http://google.com');
      $('a').html().should.be.eql('Click here to Google');
      should.not.exist($('a').attr('target'));
      $('a').attr('title').should.be.eql('Google link');
    });
  });

  describe('pullquote', function(){
    var pullquote = require('../lib/plugins/tag/pullquote');

    var raw = '123456 **bold** and *italic*',
      parsed = marked(raw);

    it('content', function(){
      var $ = cheerio.load(pullquote([], raw));

      $('blockquote').attr('class').should.be.eql('pullquote');
      $('blockquote').html().should.be.eql(parsed);
    });

    it('class', function(){
      var $ = cheerio.load(pullquote(['foo'], raw));

      $('blockquote').attr('class').should.be.eql('pullquote foo');

       var $ = cheerio.load(pullquote(['foo', 'bar'], raw));

      $('blockquote').attr('class').should.be.eql('pullquote foo bar');
    });
  });

  describe('raw', function(){
    var raw = require('../lib/plugins/tag/raw');

    it('content', function(){
      raw([], '123456789<b>strong</b>987654321').should.be.eql('123456789<b>strong</b>987654321');
    });
  });

  describe('vimeo', function(){
    var vimeo = require('../lib/plugins/tag/vimeo');

    it('id', function(){
      var $ = cheerio.load(vimeo(['foo']));

      $('.video-container').html().should.be.ok;
      $('iframe').attr('src').should.be.eql('http://player.vimeo.com/video/foo');
      $('iframe').attr('width').should.be.eql('560');
      $('iframe').attr('height').should.be.eql('315');
      $('iframe').attr('frameborder').should.be.eql('0');
      $('iframe').attr('allowfullscreen').should.be.eql('');
    });
  });

  describe('youtube', function(){
    var youtube = require('../lib/plugins/tag/youtube');

    it('id', function(){
      var $ = cheerio.load(youtube(['foo']));

      $('.video-container').html().should.be.ok;
      $('iframe').attr('src').should.be.eql('http://www.youtube.com/embed/foo');
      $('iframe').attr('width').should.be.eql('560');
      $('iframe').attr('height').should.be.eql('315');
      $('iframe').attr('frameborder').should.be.eql('0');
      $('iframe').attr('allowfullscreen').should.be.eql('');
    });
  });
});