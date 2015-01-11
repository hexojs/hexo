module.exports = function(ctx){
  var filter = ctx.extend.filter;

  filter.register('before_exit', require('./save_database'));
  filter.register('before_exit', require('./stop_watcher'));
};