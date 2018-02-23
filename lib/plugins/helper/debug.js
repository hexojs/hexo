'use strict';

const util = require('util');

// this format object as string, resolves circular reference
function inspectObject(object, options) {
  return util.inspect(object, options);
}

// wrapper to log to console
function log(...args) {
  return console.log.apply(null, args);
}

exports.inspectObject = inspectObject;
exports.log = log;
