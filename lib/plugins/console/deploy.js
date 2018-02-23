'use strict';

const _ = require('lodash');
const fs = require('hexo-fs');
const chalk = require('chalk');
const Promise = require('bluebird');

function deployConsole(args) {
  let config = this.config.deploy;
  const deployers = this.extend.deployer.list();
  const self = this;

  if (!config) {
    let help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Available deployer plugins:\n';
    help += `  ${Object.keys(deployers).join(', ')}\n\n`;
    help += `For more help, you can check the online docs: ${chalk.underline('http://hexo.io/')}`;

    console.log(help);
    return;
  }

  return new Promise((resolve, reject) => {
    const generateArgs = _.clone(args);
    generateArgs.d = false;
    generateArgs.deploy = false;

    if (args.g || args.generate) {
      self.call('generate', args).then(resolve, reject);
    } else {
      fs.exists(self.public_dir, exist => {
        if (exist) return resolve();
        self.call('generate', args).then(resolve, reject);
      });
    }
  }).then(() => {
    self.emit('deployBefore');

    if (!Array.isArray(config)) config = [config];
    return config;
  }).each(item => {
    if (!item.type) return;

    const type = item.type;

    if (!deployers[type]) {
      self.log.error('Deployer not found: %s', chalk.magenta(type));
      return;
    }

    self.log.info('Deploying: %s', chalk.magenta(type));

    return deployers[type].call(self, _.extend({}, item, args)).then(() => {
      self.log.info('Deploy done: %s', chalk.magenta(type));
    });
  }).then(() => {
    self.emit('deployAfter');
  });
}

module.exports = deployConsole;
