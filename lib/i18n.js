var fs = require('graceful-fs'),
  async = require('async'),
  pathFn = require('path'),
  vsprintf = require('sprintf-js').vsprintf;

var i18n = function(){
  this.store = {};
};

i18n.prototype._getCode = function(lang){
  var split = lang.toLowerCase().replace(/_/g, '-').split('-'),
    code = 'default',
    store = this.store;

  for (var i = 0, len = split.length; i < len; i++){
    var str = split.join('-');

    if (store.hasOwnProperty(str)){
      code = str;
      break;
    } else {
      split.pop();
    }
  }

  return code;
};

i18n.prototype.get = function(lang){
  var code = this._getCode(lang),
    store = this.store[code];

  return function(){
    var args = Array.prototype.slice.call(arguments),
      keys = args.shift().replace(/\[(\w+)\]/g, '.$1').split('.'),
      cursor = store;

    for (var i = 0, len = keys.length; i < len; i++){
      cursor = cursor[keys[i]];
    }

    return vsprintf(cursor, args);
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
        if (extname !== '.yml' || extname !== '.yaml') return next();

        render.render({path: pathFn.join(path, item)}, function(err, content){
          if (err) return callback(err);

          self.store[name] = content;

          next();
        });
      }, callback);
    });
  });
};