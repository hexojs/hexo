var async = require('async');

module.exports = function(){
  async.series([
    function(next){
      require('../config')(process.cwd(), next);
    },
    function(next){
      require('../theme').init(next);
    },
    function(next){
      require('../theme').assets(next);
    }
  ], function(){
    require('../generate')();
  });
};