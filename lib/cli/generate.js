var async = require('async'),
  extend = require('../extend');

extend.console.register('generate', 'Generate static files', function(args){
  async.series([
    function(next){
      require('../theme').init(next);
    }
  ], function(){
    require('../generate')();
  });
});