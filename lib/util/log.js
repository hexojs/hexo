var clc = require('cli-color'),
  util = require('util');

var printLog = function(args, message, color){
  var content = util.format.apply(undefined, args);

  console.log('[%s] %s', clc[color](message), content);
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

exports.success = function(){
  printLog(arguments, 'SUCCESS', 'green');
};

exports.debug = function(){
  printLog(arguments, 'DEBUG', 'gray');
};