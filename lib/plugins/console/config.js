var extend = require('../../extend');

extend.console.register('config', 'Display configuration', function(args, callback){
  console.log(hexo.config);
  callback();
});