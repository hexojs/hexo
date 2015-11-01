'use strict';

var crypto = require('crypto');
var should = require('chai').should(); // eslint-disable-line

describe('gravatar', function() {
  var gravatar = require('../../../lib/plugins/helper/gravatar');

  function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  var email = 'abc@abc.com';
  var hash = md5(email);

  it('default', function() {
    gravatar(email).should.eql('https://www.gravatar.com/avatar/' + hash);
  });

  it('size', function() {
    gravatar(email, 100).should.eql('https://www.gravatar.com/avatar/' + hash + '?s=100');
  });

  it('options', function() {
    gravatar(email, {
      s: 200,
      r: 'pg',
      d: 'mm'
    }).should.eql('https://www.gravatar.com/avatar/' + hash + '?s=200&r=pg&d=mm');
  });
});
