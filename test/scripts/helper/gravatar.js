var crypto = require('crypto'),
  should = require('chai').should();

describe('gravatar', function(){
  var gravatar = require('../../../lib/plugins/helper/gravatar');

  var md5 = function(str){
    return crypto.createHash('md5').update(str).digest('hex');
  };

  var email = 'abc@abc.com',
    hash = md5(email);

  it('default', function(){
    gravatar(email).should.eql('http://www.gravatar.com/avatar/' + hash);
  });

  it('size', function(){
    gravatar(email, 100).should.eql('http://www.gravatar.com/avatar/' + hash + '?s=100');
  });

  it('options', function(){
    gravatar(email, {
      s: 200,
      r: 'pg',
      d: 'mm'
    }).should.eql('http://www.gravatar.com/avatar/' + hash + '?s=200&r=pg&d=mm');
  });
});