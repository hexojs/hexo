var crypto = require('crypto'),
  querystring = require('querystring');

var md5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

module.exports = function(email, options){
  if (typeof options === 'number'){
    options = {s: options};
  }

  var str = 'http://www.gravatar.com/avatar/' + md5(email.toLowerCase()),
    qs = querystring.stringify(options);

  if (qs) str += '?' + qs;

  return str;
};