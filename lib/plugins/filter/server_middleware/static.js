var serveStatic = require('serve-static');

module.exports = function(app){
  app.use(this.config.root, serveStatic(this.public_dir));
};