module.exports = function(ctx){
  var filter = ctx.extend.filter;

  filter.register('server_middleware', require('./logger'));
  filter.register('server_middleware', require('./header'));
  filter.register('server_middleware', require('./route'));
  filter.register('server_middleware', require('./static'));
  filter.register('server_middleware', require('./redirect'));
  filter.register('server_middleware', require('./gzip'));
};