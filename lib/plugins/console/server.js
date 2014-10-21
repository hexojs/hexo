var connect = require('connect'),
  http = require('http'),
  colors = require('colors'),
  HexoError = require('../../error');

module.exports = function(args, callback){
  var config = hexo.config,
    log = hexo.log;

  var app = connect(),
    serverIp = args.i || args.ip || config.server_ip || 'localhost',
    port = parseInt(args.p || args.port || config.port, 10) || 4000,
    useDrafts = args.d || args.drafts || config.render_drafts || false,
    root = config.root;

  // If the port setting is invalid, set to the default port 4000
  if (port > 65535 || port < 1){
    port = 4000;
  }

  // Drafts
  if (useDrafts) {
    var draftDir = '_drafts/';
    var draftDirLength = draftDir.length;
    var regex = require('../processor/index.js').regex;
    hexo.extend.processor.register(function(path){
      if (!hexo.render.isRenderable(path)) return false;
      if (regex.tmpFile.test(path)) return false;
      if (path.substring(0, draftDirLength) !== draftDir) return false;

      var str = path.substring(draftDirLength);
      if (!regex.hiddenFile.test(str)) return false;

      return {path: str};
    }, require('../processor/post'));
  }

  hexo.extend.filter.apply('server_middleware', app);

  // Load source files
  hexo.post.load({watch: true}, function(err){
    if (err) return callback(err);

    // Start listening!
    var server = http.createServer(app).listen(port, serverIp, function(){
      if (useDrafts){
        log.i('Using drafts.');
      }

      log.i('Hexo is running at ' + 'http://%s:%d%s'.underline + '. Press Ctrl+C to stop.', serverIp, port, root);

      /**
      * Fired after server started.
      *
      * @event server
      * @for Hexo
      */

      hexo.emit('server');
    });

    server.on('error', function(err){
      switch (err.code){
        case 'EADDRINUSE':
          err = HexoError.wrap(err, 'Port ' + port + ' has been used. Try other port instead.');
          break;

        case 'EACCES':
          err = HexoError.wrap(err, 'Permission denied. You can\'t use port ' + port + '.');
          break;
      }

      callback(err);
    });
  });
};
