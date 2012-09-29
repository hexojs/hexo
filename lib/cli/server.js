module.exports = function(){
  require('../config')(process.cwd(), function(){
    require('../server')();
  });
};