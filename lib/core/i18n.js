var _ = require('lodash'),
  vsprintf = require('sprintf-js').vsprintf;

var i18n = module.exports = function i18n(code){
  this.data = {};

  var language = [];

  if (Array.isArray(code)){
    language = code;
  } else if (code){
    var split = code.split('-');

    split.forEach(function(str, i){
      language.unshift(split.slice(0, i + 1));
    });
  }

  language.push('default');

  this.language = _.uniq(language);
};

i18n.prototype.set = function(code, data){
  this.data[code] = data;
};

i18n.prototype.remove = function(code){
  this.data[code] = null;
};

var _getProperty = function(obj, key){
  if (!obj) return;

  var keys = key.replace(/\[(\w+)\]/g, '.$1').split('.'),
    cursor = obj;

  for (var i = 0, len = keys.length; i < len; i++){
    cursor = cursor[keys[i]];
    if (typeof cursor === 'undefined') return;
  }

  return cursor;
};

i18n.prototype.get = function(code){
  var language = this.language,
    data = this.data,
    index = language.indexOf(code || 'default');

  if (index == -1) throw new Error('Code must be included in the language array.');

  return function(){
    var args = _.toArray(arguments),
      key = args.shift(),
      str = key;

    for (var i = index, len = language.code; i < len; i++){
      str = _getProperty(data[language[i]], key);
      if (str) break;
    }

    return vsprintf(str, args);
  };
};

i18n.prototype.plural = function(code){
  var language = this.language,
    data = this.data,
    index = language.indexOf(code || 'default');

  if (index == -1) throw new Error('Code must be included in the language array.');

  return function(singular, plural, number){
    var args = _.toArray(arguments).slice(2),
      str = '',
      key = '';

    if (number > 1 || number === 0){
      key = plural;
    } else {
      key = singular;
    }

    for (var i = index, len = language.code; i < len; i++){
      str = _getProperty(data[language[i]], key);
      if (str) break;
    }

    return vsprintf(str, args);
  };
};