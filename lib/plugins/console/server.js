var connect = require('connect'),
  http = require('http'),
  colors = require('colors');

module.exports = function(args, callback){
  var config = hexo.config,
    log = hexo.log;

  var app = connect(),
    serverIp = args.i || args.ip || config.server_ip || '0.0.0.0',
    port = parseInt(args.p || args.port || config.port, 10) || 4000,
    useDrafts = args.d || args.drafts || config.render_drafts || false,
    root = config.root;

  // If the port setting is invalid, set to the default port 4000
  if (port > 65535 || port < 1){
    port = 4000;
  }

  // Drafts
  if (useDrafts) {
    hexo.extend.processor.register('_drafts/*path', require('../processor/post'));
  }

  hexo.extend.filter.apply('server_middleware', app);

  // Load source files
  hexo.post.load({watch: true}, function(err){
    if (err) return callback(err);

    // Start listening!
    http.createServer(app).listen(port, serverIp, function(){
      if (useDrafts){
        log.i('Using drafts.');
      }

      // for display purpose only
      var ip = serverIp === '0.0.0.0' ? 'localhost' : serverIp;

      log.i('Hexo is running at ' + 'http://%s:%d%s'.underline + '. Press Ctrl+C to stop.', ip, port, root);

      /**
      * Fired after server started.
      *
      * @event server
      * @for Hexo
      */

      hexo.emit('server');
    });
  });
};
