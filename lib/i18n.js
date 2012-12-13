var compile = require('./render').compile,
  format = require('util').format,
  fs = require('fs'),
  _ = require('underscore');

var i18n = function(namespace){
  this.namespace = namespace;
  this.store = {};
};

i18n.prototype.get = function(){
  var args = _.toArray(arguments),
    str = args.shift();

  return format.apply(null, args.unshift(this.store[str]));
};

i18n.prototype.set = function(str, result){
  this.store[str] = result;
};

i18n.prototype.load = function(path, callback){
  var lang = hexo.config && hexo.config.language ? hexo.config.language : 'default';

  compile(path + '/' + lang + '.yml', function(err, result){
    if (err) throw err;
    if (result) this.store = result;
    callback(null, result ? true : false);
  });
};

module.exports = i18n;