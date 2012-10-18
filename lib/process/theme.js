var extend = require('../extend'),
  theme = require('../theme');

extend.process.register(function(locals, callback){
  theme.assets(function(){
    console.log('Theme installed.');
    callback();
  });
});