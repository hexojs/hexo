describe('Tags', function(){
  describe('blockquote', function(){
    //
  });

  describe('code', function(){
    //
  });

  describe('gist', function(){
    var gist = require('../lib/plugins/tag/gist');

    it('id', function(){
      gist(['1234567890']).should.be.eql('<script src="https://gist.github.com/1234567890.js"></script>');
    });

    it('file', function(){
      gist(['1234567890', 'abcd']).should.be.eql('<script src="https://gist.github.com/1234567890.js?file=abcd"></script>');
    });
  });

  describe('iframe', function(){
    var iframe = require('../lib/plugins/tag/iframe');

    it('url', function(){
      iframe(['http://zespia.tw']).should.be.eql('<iframe src="http://zespia.tw" width="100%" height="300" frameborder="0" allowfullscreen></iframe>');
    });

    it('width', function(){
      iframe(['http://zespia.tw', '500']).should.be.eql('<iframe src="http://zespia.tw" width="500" height="300" frameborder="0" allowfullscreen></iframe>');
    });

    it('height', function(){
      iframe(['http://zespia.tw', '500', '600']).should.be.eql('<iframe src="http://zespia.tw" width="500" height="600" frameborder="0" allowfullscreen></iframe>');
    });
  });

  describe('img', function(){
    var img = require('../lib/plugins/tag/img');

    it('src', function(){
      img(['http://placekitten.com/200/300']).should.be.eql('<img src="http://placekitten.com/200/300">');
    });

    it('class + src', function(){
      img(['left', 'http://placekitten.com/200/300']).should.be.eql('<img src="http://placekitten.com/200/300" class="left">');
    });

    it('multiple classes + src', function(){
      img('left top http://placekitten.com/200/300'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left top">');
    });

    it('class + src + width', function(){
      img('left http://placekitten.com/200/300 200'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" width="200">');
    });

    it('class + src + width + height', function(){
      img('left http://placekitten.com/200/300 200 300'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" width="200" height="300">');
    });

    it('class + src + title', function(){
      img('left http://placekitten.com/200/300 Place Kitten'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" title="Place Kitten">');
    });

    it('class + src + width + title', function(){
      img('left http://placekitten.com/200/300 200 Place Kitten'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" width="200" title="Place Kitten">');
    });

    it('class + src + width + height + title', function(){
      img('left http://placekitten.com/200/300 200 300 Place Kitten'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" width="200" height="300" title="Place Kitten">');
    });

    it('class + src + width + height + title + alt', function(){
      img('left http://placekitten.com/200/300 200 300 "Place Kitten" "A cute kitten"'.split(' ')).should.be.eql('<img src="http://placekitten.com/200/300" class="left" width="200" height="300" title="Place Kitten" alt="A cute kitten">');
    });
  });

  describe('jsfiddle', function(){
    var jsfiddle = require('../lib/plugins/tag/jsfiddle');

    it('id', function(){
      jsfiddle(['1234567890']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
    });

    it('tabs', function(){
      jsfiddle(['1234567890', 'default']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
      jsfiddle(['1234567890', 'js,html,css,result']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
    });

    it('skin', function(){
      jsfiddle(['1234567890', 'default', 'default']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
      jsfiddle(['1234567890', 'default', 'dark']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/dark" frameborder="0" allowfullscreen></iframe>');
    });

    it('width', function(){
      jsfiddle(['1234567890', 'default', 'default', 'default']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
      jsfiddle(['1234567890', 'default', 'default', '500']).should.be.eql('<iframe width="500" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
    });

    it('height', function(){
      jsfiddle(['1234567890', 'default', 'default', 'default', 'default']).should.be.eql('<iframe width="100%" height="300" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
      jsfiddle(['1234567890', 'default', 'default', 'default', '400']).should.be.eql('<iframe width="100%" height="400" src="http://jsfiddle.net/1234567890/embedded/js,resources,html,css,result/light" frameborder="0" allowfullscreen></iframe>');
    });
  });

  describe('link', function(){
    var link = require('../lib/plugins/tag/link');

    it('text + url', function(){
      link('Click here to Google http://google.com'.split(' ')).should.be.eql('<a href="http://google.com">Click here to Google</a>');
    });

    it('text + url + external', function(){
      link('Click here to Google http://google.com true'.split(' ')).should.be.eql('<a href="http://google.com" target="_blank">Click here to Google</a>');
      link('Click here to Google http://google.com false'.split(' ')).should.be.eql('<a href="http://google.com">Click here to Google</a>');
    });

    it('text + url + title', function(){
      link('Click here to Google http://google.com Google link'.split(' ')).should.be.eql('<a href="http://google.com" title="Google link">Click here to Google</a>');
    });

    it('text + url + external + title', function(){
      link('Click here to Google http://google.com true Google link'.split(' ')).should.be.eql('<a href="http://google.com" title="Google link" target="_blank">Click here to Google</a>');
    });
  });

  describe('pullquote', function(){
    //
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
      vimeo(['1234567890']).should.be.eql('<div class="video-container"><iframe src="http://player.vimeo.com/video/1234567890" width="560" height="315" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>');
    });
  });

  describe('youtube', function(){
    var youtube = require('../lib/plugins/tag/youtube');

    it('id', function(){
      youtube(['1234567890']).should.be.eql('<div class="video-container"><iframe width="560" height="315" src="http://www.youtube.com/embed/1234567890" frameborder="0" allowfullscreen></iframe></div>');
    });
  });
});