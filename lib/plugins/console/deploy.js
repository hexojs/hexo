var async = require('async'),
  fs = require('graceful-fs'),
  colors = require('colors'),
  _ = require('lodash');

module.exports = function(args, callback){
  var config = hexo.config.deploy,
    log = hexo.log,
    extend = hexo.extend,
    deployer = extend.deployer.list();

  if (!config || !config.type){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Available Types:',
      '  ' + Object.keys(deployer).join(', '),
      '',
      'For more help, you can check the online docs: ' + 'http://zespia.tw/hexo/'.underline
    ];

    console.log(help.join('\n'));
    callback();
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

      log.i('Start deploying: ' + type);

      deployer[type](_.extend({}, item, args), function(err){
        if (err) return callback(err);

        log.i('Deploy done: ' + type);
        next();
      });
    }, onDeployFinished);
  });
};