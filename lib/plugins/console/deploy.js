'use strict';

var _ = require('lodash');
var fs = require('hexo-fs');
var chalk = require('chalk');
var Promise = require('bluebird');

function deployConsole(args){
  /* jshint validthis: true */
  var config = this.config.deploy;
  var deployers = this.extend.deployer.list();
  var self = this;

  if (!config){
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Available deployer plugins:\n';
    help += '  ' + Object.keys(deployers).join(', ') + '\n\n';
    help += 'For more help, you can check the online docs: ' + chalk.underline('http://hexo.io/');

    console.log(help);
    return;
  }

  return new Promise(function(resolve, reject){
    var generateArgs = _.clone(args);
    generateArgs.d = false;
    generateArgs.deploy = false;

    if (args.g || args.generate){
      self.call('generate', args).then(resolve, reject);
    } else {
      fs.exists(self.public_dir, function(exist){
        if (exist) return resolve();
        self.call('generate', args).then(resolve, reject);
      });
    }
  }).then(function(){
    self.emit('deployBefore');

    if (!Array.isArray(config)) config = [config];
    return config;
  }).each(function(item){
    if (!item.type) return;

    var type = item.type;

    if (!deployers[type]){
      self.log.error('Deployer not found: %s', chalk.magenta(type));
      return;
    }

    self.log.info('Deploying: %s', chalk.magenta(type));

    return deployers[type].call(self, _.extend({}, item, args)).then(function(){
      self.log.info('Deploy done: %s', chalk.magenta(type));
    });
  }).then(function(){
    self.emit('deployAfter');
  });
}

module.exports = deployConsole;