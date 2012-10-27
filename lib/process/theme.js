var extend = require('../extend'),
  theme = require('../theme');

extend.process.register(function(locals, callback){
  console.log('Installing theme.');
  
  theme.assets(function(){
    callback();
  });
});