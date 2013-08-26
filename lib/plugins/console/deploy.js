var async = require('async'),
  fs = require('graceful-fs'),
  colors = require('colors');

var log = hexo.log,
  extend = hexo.extend,
  deployer = extend.deployer.list();

module.exports = function(args, callback){
  var config = hexo.config.deploy;

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

  generate(function(err){
    if (err) return callback(err);

    async.forEachSeries(config, function(item, next){
      var type = item.type;

      log.i('Start deploying: ' + type);

      deployer[type](args, function(err){
        if (err) return callback(err);

        log.i('Deploy done: ' + type);
        next();
      });
    }, callback);
  });
};