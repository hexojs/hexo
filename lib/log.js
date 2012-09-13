var clc = require('cli-color'),
  util = require('util');

var printLog = function(args, color){
  console.log('%s - %s', clc[color](new Date().toISOString()), util.format.apply(undefined, args));
};

exports.error = function(){
  printLog(arguments, 'red');
};

exports.warning = function(){
  printLog(arguments, 'yellow');
};

exports.info = function(){
  printLog(arguments, 'cyan');
};

exports.debug = function(){
  printLog(arguments, 'gray');
};