var extend = require('../extend'),
  route = require('../route'),
  clc = require('cli-color');

extend.console.register('routes', 'Display all routes', function(args){
  require('../generate')(false, true, function(){
    var list = Object.keys(route.list());

    console.log(clc.bold('Routes:'));

    list.forEach(function(key){
      console.log('- ' + key);
    });
  });
});