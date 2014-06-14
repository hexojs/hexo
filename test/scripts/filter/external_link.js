var should = require('chai').should();

describe('external_link', function(){
  var external_link = require('../../../lib/plugins/filter/external_link');

  it('internal link', function(){
    external_link({
      content: '<a href="foo.html">foo</a>'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('<a href="foo.html">foo</a>');
    });
  });

  it('external link', function(){
    external_link({
      content: '<a href="http://zespia.tw">Zespia</a>'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('<a href="http://zespia.tw" target="_blank" rel="external">Zespia</a>');
    });
  });

  it('external link but already has target="_blank" attribute', function(){
    external_link({
      content: '<a href="http://zespia.tw" target="_blank">Zespia</a>'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('<a href="http://zespia.tw" target="_blank">Zespia</a>');
    });
  });
});