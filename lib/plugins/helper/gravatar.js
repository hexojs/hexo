var extend = require('../../extend'),
  crypto = require('crypto');

var md5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

extend.helper.register('gravatar', function(){
  return function(email, size){
    return 'http://www.gravatar.com/avatar/' + md5(email.toLowerCase()) + (size ? '?s=' + size : '');
  }
});