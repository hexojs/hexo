var extend = require('../extend');

extend.console.register('config', 'Display configuration', function(args){
  console.log(hexo.config);
});