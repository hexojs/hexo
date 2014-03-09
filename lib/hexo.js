var _ = require('lodash');

exports.init = function(options, callback){
  options = _.extend({
    cwd: process.cwd(),
    _: []
  }, options);

  if (options.command){
    options._.unshift(options.command);
  }

  return require('./init')(options.cwd, options, callback);
};

exports.util = require('./util');