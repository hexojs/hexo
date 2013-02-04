var extend = require('../../extend'),
  _ = require('underscore');

extend.console.register('config', 'Display configuration', function(args, callback){
  var obj = {};
  _.each(hexo.config, function(val, key){
    obj[key] = val;
  });

  console.log(obj);
  callback();
});