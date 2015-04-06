'use strict';

var util = require('util');

// this solves circular reference in object
function inspectObject(object, options){
  return util.inspect(object, options);
}

exports.inspectObject = inspectObject;
