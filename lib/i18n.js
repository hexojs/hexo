var format = require('util').format,
  fs = require('fs'),
  _ = require('underscore'),
  lang = 'default',
  compile;

var i18n = function(){
  var _store = {};

  this.get = function(){
    var args = _.toArray(arguments),
      str = args.shift();

    if (_store[str]) return format.apply(null, args.unshift(_store[str]));
  };

  this.set = function(str, result){
    _store[str] = result;
  };

  this.list = function(){
    return _store;
  };

  this.load = function(path, callback){
    if (!compile) compile = require('./render').compile;
    if (hexo.config && hexo.config.language) lang = hexo.config.language;

    var target = path + '/' + lang + '.yml';

    fs.exists(target, function(exist){
      if (!exist) target = path + '/default.yml';

      compile(target, function(err, result){
        if (result) _store = result;
        callback(err, result ? true : false);
      });
    });
  };
};

exports.i18n = i18n;
//exports.core = new i18n();