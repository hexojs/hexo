var should = require('chai').should();

describe('format', function(){
  var format = require('../../../lib/util/format');

  it('stripHtml()', function(){
    format.stripHtml('Strip <i>these</i> tags!').should.eql('Strip these tags!');
    format.stripHtml('<b>Bold</b> no more!  <a href="more.html">See more here</a>...')
      .should.eql('Bold no more!  See more here...');
    format.stripHtml('<div id="top-bar">Welcome to my website!</div>')
      .should.eql('Welcome to my website!');
  });

  it('trim()', function(){
    format.trim('   foo bar baz    ').should.eql('foo bar baz');
    format.trim('   foo bar baz').should.eql('foo bar baz');
    format.trim('foo bar baz    ').should.eql('foo bar baz');
    format.trim('foo bar baz').should.eql('foo bar baz');
  });

  it.skip('wordWrap()', function(){
    //
  });

  it.skip('truncate()', function(){
    //
  });
});