/**
 * Module dependencies.
 */

var optimist = require('optimist'),
  _ = require('lodash'),
  extend = require('./extend'),
  console = extend.console.list();

/**
 * Call other Hexo console plugins.
 *
 * @param {String} name
 * @param {Object} args
 * @param {Function} callback
 * @api public
 */

module.exports = function(name, args, callback){
  if (_.isFunction(args)){
    callback = args;
    args = [];
  }

  if (!Array.isArray(args)) args = [args];
  args = optimist.parse(args);
  console[name](args, callback);
};