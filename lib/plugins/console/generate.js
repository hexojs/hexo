var extend = require('../../extend');

extend.console.register('generate', 'Generate static files', function(args){
  var generate = require('../../generate');

  generate({}, function(){
    console.log('generated');
  });
});