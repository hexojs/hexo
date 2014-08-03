var async = require('async'),
  fs = require('graceful-fs'),
  colors = require('colors'),
  _ = require('lodash');

module.exports = function(args, callback){
  var config = hexo.config.deploy,
    log = hexo.log,
    extend = hexo.extend,
    deployers = extend.deployer.list();

  if (!config){
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Available Types:\n';
    help += '  ' + Object.keys(deployers).join(', ') + '\n\n';
    help += 'For more help, you can check the online docs: ' + 'http://hexo.io/'.underline;

    console.log(help);

    return callback();
  }

  if (!Array.isArray(config)) config = [config];

  var generate = function(callback){
    if (args.g || args.generate){
      hexo.call('generate', callback);
    } else {
      fs.exists(hexo.public_dir, function(exist){
        if (exist) return callback();

        hexo.call('generate', callback);
      });
    }
  };

  var onDeployStarted = function() {
    /**
    * Fired before deployment.
    *
    * @event deployBefore
    * @for Hexo
    */
    hexo.emit('deployBefore');
  };

  var onDeployFinished = function(err) {
    /**
    * Fired after deployment.
    *
    * @event deployAfter
    * @param {Error} err
    * @for Hexo
    */
    hexo.emit('deployAfter', err);
    callback(err);
  };

  generate(function(err){
    if (err) return callback(err);

    onDeployStarted();

    async.eachSeries(config, function(item, next){
      var type = item.type;

      if (!deployers.hasOwnProperty(type)){
        log.e('Deployer not found: ' + type);
        return next();
      } else {
        log.i('Start deploying: ' + type);
      }

      deployers[type](_.extend({}, item, args), function(err){
        if (err) return next(err);

        log.i('Deploy done: ' + type);
        next();
      });
    }, onDeployFinished);
  });
};