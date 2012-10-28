var extend = require('../extend'),
  theme = require('../theme');

extend.processor.register(function(locals, callback){
  console.log('Installing theme.');
  
  theme.assets(function(){
    callback();
  });
});