var clc = require('cli-color'),
  fs = require('graceful-fs'),
  util = require('util'),
  ansiTrim = require('cli-color/lib/trim');

var printLog = function(args, message, color){
  var content = util.format.apply(undefined, args),
    date = new Date().toISOString();

  console.log('%s [%s] %s', date, clc[color](message), content);
  //fs.appendFile(__dirname + '/../debug.log', util.format('%s [%s] %s\n', date, message, ansiTrim(content)));
};

exports.error = function(){
  printLog(arguments, 'ERROR', 'red');
};

exports.warning = function(){
  printLog(arguments, 'WARNING', 'yellow');
};

exports.info = function(){
  printLog(arguments, 'INFO', 'cyan');
};

exports.debug = function(){
  printLog(arguments, 'DEBUG', 'gray');
};