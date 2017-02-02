'use strict';

var yaml = require('js-yaml');
var fs = require('hexo-fs');
var pathFn = require('path');
var Promise = require('bluebird');

function configConsole(args) {
  var key = args._[0];
  var value = args._[1];
  var self = this;

  if (!key) {
    console.log(this.config);
    return Promise.resolve();
  }

  if (!value) {
    value = getProperty(this.config, key);
    if (value) console.log(value);
    return Promise.resolve();
  }

  var configPath = this.config_path;
  var extname = pathFn.extname(configPath);

  return fs.exists(configPath).then(function(exist) {
    if (!exist) return {};
    return self.render.render({path: configPath});
  }).then(function(config) {
    if (!config) config = {};

    var result = '';

    setProperty(config, key, castValue(value));

    if (extname === '.json') {
      result = JSON.stringify(config);
    } else {
      result = yaml.safeDump(config);
    }

    return fs.writeFile(configPath, result);
  });
}

function getProperty(obj, key) {
  var split = key.split('.');
  var result = obj[split[0]];

  for (var i = 1, len = split.length; i < len; i++) {
    result = result[split[i]];
  }

  return result;
}

function setProperty(obj, key, value) {
  var split = key.split('.');
  var cursor = obj;
  var name = '';
  var lastKey = split.pop();

  for (var i = 0, len = split.length; i < len; i++) {
    name = split[i];
    cursor = cursor[name] = cursor[name] || {};
  }

  cursor[lastKey] = value;
}

function castValue(value) {
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
