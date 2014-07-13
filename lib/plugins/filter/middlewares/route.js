var pathFn = require('path'),
  Readable = require('stream').Readable,
  serverUtil = require('../../../util/server');

module.exports = function(app){
  var config = hexo.config,
    args = hexo.env.args,
    root = config.root,
    route = hexo.route;

  if (args.s || args.static) return;

  app.use(root, function(req, res, next){
    var method = req.method;
    if (method !== 'GET' && method !== 'HEAD') return next();

    var url = route.format(decodeURIComponent(req.url)),
      target = route.get(url);

    // When the URL is `foo/index.html` but users access `foo`, redirect to `foo/`.
    if (!target){
      if (pathFn.extname(url)) return next();

      return serverUtil.redirect(res, root + url + '/');
    }

    target(function(err, result){
      if (err) return next(err);
      if (result == null) return next();

      serverUtil.contentType(res, pathFn.extname(url));

      if (method === 'HEAD') return res.end();

      if (result instanceof Readable){
        result.pipe(res).on('error', next);
      } else {
        res.end(result);
      }
    });
  });
};