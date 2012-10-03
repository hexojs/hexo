var async = require('async');

module.exports = function(){
  async.series([
    function(next){
      require('../config')(process.cwd(), next);
    },
    function(next){
      require('../loader')(next);
    },
    function(next){
      require('../theme').init(next);
    }
  ], function(){
    require('../generate')();
  });
};