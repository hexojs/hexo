var compress = require('compression');

module.exports = function(app){
  app.use(compress());
};