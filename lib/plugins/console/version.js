'use strict';

var os = require('os');

module.exports = function(args){
  var versions = process.versions;
  var keys = Object.keys(versions);
  var key = '';

  console.log('hexo:', this.version);
  console.log('os:', os.type(), os.release(), os.platform(), os.arch());

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    console.log('%s: %s', key, versions[key]);
  }
};