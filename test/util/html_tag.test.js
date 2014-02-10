describe('Util - html_tag', function(){
  var html_tag = require('../../lib/util/html_tag');

  it('tag', function(){
    html_tag('hr').should.eql('<hr>');
  });

  it('tag + attrs', function(){
    html_tag('img', {
      src: 'http://placekitten.com/200/300'
    }).should.eql('<img src="http://placekitten.com/200/300">');

    html_tag('img', {
      src: 'http://placekitten.com/200/300',
      width: 200,
      height: 300
    }).should.eql('<img src="http://placekitten.com/200/300" width="200" height="300">');
  });

  it('tag + attrs + text', function(){
    html_tag('a', {
      href: 'http://zespia.tw'
    }, 'My blog').should.eql('<a href="http://zespia.tw">My blog</a>');
  });
});