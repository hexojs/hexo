var serveStatic = require('serve-static');

module.exports = function(app){
  app.use(hexo.config.root, serveStatic(hexo.public_dir));
};