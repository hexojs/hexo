var Promise = require('bluebird');

module.exports = function(ms){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve();
    }, ms);
  });
};