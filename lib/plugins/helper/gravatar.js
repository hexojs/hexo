'use strict';

var crypto = require('crypto');
var querystring = require('querystring');

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function gravatarHelper(email, options) {
  if (typeof options === 'number') {
    options = {s: options};
  }

  var str = 'https://www.gravatar.com/avatar/' + md5(email.toLowerCase());
  var qs = querystring.stringify(options);

  if (qs) str += '?' + qs;

  return str;
}

module.exports = gravatarHelper;
