'use strict';

var util = require('util');

// this solves circular reference in object
function inspectObject(object, options){
  return util.inspect(object, options);
}

// wrapper to log to console
function serverLog(){
  return console.log.call(null, arguments);
}

exports.inspectObject = inspectObject;
exports.serverLog = serverLog;
