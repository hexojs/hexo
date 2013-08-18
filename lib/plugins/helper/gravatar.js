var crypto = require('crypto'),
  _ = require('lodash');

var md5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

module.exports = function(email, options){
  if (_.isNumber(options)){
    options = {s: options};
  }

  var str = 'http://www.gravatar.com/avatar/' + md5(email.toLowerCase()),
    keys = options ? Object.keys(options) : [],
    qs = [];

  for (var i = 0, len = keys.length; i < len; i++){
    var key = keys[i];

    qs.push(key + '=' + options[key]);
  }

  if (qs.length){
    str += '?' + qs.join('&');
  }

  return str;
};