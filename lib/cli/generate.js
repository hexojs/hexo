var async = require('async');

module.exports = function(){
  async.series([
    function(next){
      require('../config').init(next);
    },
    function(next){
      require('../theme').config.init(next);
    }
  ], function(next){
    require('../generate')();
  });
};