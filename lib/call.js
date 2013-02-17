var optimist = require('optimist'),
  _ = require('lodash'),
  extend = require('./extend'),
  console = extend.console.list();

module.exports = function(name, args, callback){
  if (_.isFunction(args)){
    callback = args;
    args = [];
  }

  if (!_.isArray(args)) args = [args];
  args = optimist.parse(args);
  console[name](args, callback);
};