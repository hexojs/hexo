var extend = require('./extend'),
  console = extend.console.list();

module.exports = function(name, args, callback){
  console[name](args, callback);
};