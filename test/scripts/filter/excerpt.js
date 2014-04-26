var should = require('chai').should();

describe('Filter - excerpt', function(){
  var excerpt = require('../../../lib/plugins/filter/excerpt');

  it('with tag', function(){
    excerpt({
      content: '12345<!-- more -->67890'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('12345<a id="more"></a>67890');
      data.excerpt.should.eql('12345');
    });
  });

  it('no tags', function(){
    excerpt({
      content: '1234567890'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('1234567890');
      data.excerpt.should.eql('');
    });
  });
});