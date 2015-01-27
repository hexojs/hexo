'use strict';

var yaml = require('js-yaml');
var fs = require('hexo-fs');

// TODO: json support
function configConsole(args){
  /* jshint validthis: true */
  var key = args._[0];
  var value = args._[1];

  if (!key){
    console.log(this.config);
    return;
  }

  if (!value){
    value = getProperty(this.config, key);
    if (value) console.log(value);
    return;
  }

  var configPath = this.config_path;

  return this.render.render({path: configPath}).then(function(config){
    if (!config) config = {};

    setProperty(config, key, castValue(value));
    return fs.writeFile(configPath, yaml.safeDump(config));
  });
}

function getProperty(obj, key){
  var split = key.split('.');
  var result = obj[split[0]];

  for (var i = 1, len = split.length; i < len; i++){
    result = result[split[i]];
  }

  return result;
}

function setProperty(obj, key, value){
  var split = key.split('.');
  var cursor = obj;
  var name = '';
  var lastKey = split.pop();

  for (var i = 0, len = split.length; i < len; i++){
    name = split[i];
    cursor = cursor[name] = cursor[name] || {};
  }

  cursor[lastKey] = value;
}

function castValue(value){
  switch (value){
    case 'true':
      return true;

    case 'false':
      return false;

    case 'null':
      return null;

    case 'undefined':
      return undefined;
  }

  var num = Number(value);
  if (!isNaN(num)) return num;

  return value;
}

module.exports = configConsole;