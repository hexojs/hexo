var fs = require('hexo-fs');
var Promise = require('bluebird');

function File(data){
  this.source = data.source;
  this.path = data.path;
  this.type = data.type;
  this.params = data.params;
  this.content = data.content;
}

function wrapReadOptions(options){
  options = options || {};
  if (typeof options === 'string') options = {encoding: options};
  if (!options.hasOwnProperty('encoding')) options.encoding = 'utf8';
  if (!options.hasOwnProperty('cache')) options.cache = true;

  return options;
}

File.prototype.read = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  var self = this;
  var content = this.content;

  options = wrapReadOptions(options);

  return new Promise(function(resolve, reject){
    if (!options.cache || !content){
      return fs.readFile(self.source, options).then(resolve, reject);
    }

    var encoding = options.encoding;

    if (encoding){
      resolve(content.toString(encoding));
    } else {
      resolve(content);
    }
  }).nodeify(callback);
};

File.prototype.readSync = function(options){
  var content = this.content;

  options = wrapReadOptions(options);

  if (!options.cache || !content){
    return fs.readFileSync(this.source, options);
  }

  var encoding = options.encoding;

  if (encoding){
    return content.toString(encoding);
  } else {
    return content;
  }
};

File.prototype.stat = function(callback){
  return fs.stat(this.source).nodeify(callback);
};

File.prototype.statSync = function(){
  return fs.statSync(this.source);
};

module.exports = File;