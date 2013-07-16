var extend = require('../../extend'),
  _ = require('lodash');

extend.console.register('version', 'Display version', {init: true, alias: 'v'}, function(args, callback){
  var result = [
    'hexo: ' + hexo.version
  ];

  _.each(process.versions, function(val, key){
    result.push(key + ': ' + val);
  });

  console.log(result.join('\n'));
  callback();
});
