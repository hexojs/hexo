var fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path'),
  vsprintf = require('sprintf-js').vsprintf;

var i18n = module.exports = function(){
  this.store = {};
};

var _getProperty = function(obj, key){
  var keys = key.replace(/\[(\w+)\]/g, '.$1').split('.'),
    cursor = obj;

  for (var i = 0, len = keys.length; i < len; i++){
    cursor = cursor[keys[i]];
  }

  return cursor;
};

i18n.prototype._getCode = function(lang){
  var lang = lang.toLowerCase().replace(/_/g, '-'),
    store = this.store,
    keys = Object.keys(store),
    code = 'default';

  if (keys.indexOf(lang) > -1){
    code = lang;
  } else {
    lang = lang.split('-')[0];

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];

      if (key.split('-')[0] === lang){
        code = key;
        break;
      }
    }
  }

  return code;
};

i18n.prototype.get = function(lang){
  var code = lang ? this._getCode(lang) : 'default',
    store = this.store[code];

  return function(){
    var args = Array.prototype.slice.call(arguments);

    return vsprintf(_getProperty(store, args.shift()), args);
  }
};

i18n.prototype.plural = function(lang){
  var code = lang ? this._getCode(lang) : 'default',
    store = this.store[code];

  return function(singular, plural, number){
    var args = Array.prototype.slice.call(arguments);

    if (number > 1 || number == 0){
      var key = plural;
    } else {
      var key = singular;
    }

    args = args.slice(2);

    return vsprintf(_getProperty(store, key), args);
  }
};

i18n.prototype.load = function(path, callback){
  var render = hexo.render,
    self = this;

  fs.exists(path, function(exist){
    if (!exist) return callback();

    fs.readdir(path, function(err, files){
      if (err) return callback(err);

      async.forEach(files, function(item, next){
        var extname = pathFn.extname(item),
          name = pathFn.basename(item, extname).toLowerCase().replace(/_/g, '-');

        // Only accepts YAML files
        if (extname !== '.yml' && extname !== '.yaml') return next();

        render.render({path: pathFn.join(path, item)}, function(err, content){
          if (err) return callback(err);

          self.store[name] = content;

          next();
        });
      }, callback);
    });
  });
};