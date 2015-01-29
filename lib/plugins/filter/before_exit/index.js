'use strict';

module.exports = function(ctx){
  var filter = ctx.extend.filter;

  filter.register('before_exit', require('./save_database'));
  // Is it necessary to stop watchers before exiting?
  // filter.register('before_exit', require('./stop_watcher'));
};