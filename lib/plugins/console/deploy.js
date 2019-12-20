'use strict';

const fs = require('hexo-fs');
const { underline, magenta } = require('chalk');
const Promise = require('bluebird');

function deployConsole(args) {
  let config = this.config.deploy;
  const deployers = this.extend.deployer.list();

  if (!config) {
    let help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Available deployer plugins:\n';
    help += `  ${Object.keys(deployers).join(', ')}\n\n`;
    help += `For more help, you can check the online docs: ${underline('https://hexo.io/')}`;

    console.log(help);
    return;
  }

  return new Promise((resolve, reject) => {
    const generateArgs = {...args};
    generateArgs.d = false;
    generateArgs.deploy = false;

    if (args.g || args.generate) {
      this.call('generate', args).then(resolve, reject);
    } else {
      fs.exists(this.public_dir, exist => {
        if (exist) return resolve();
        this.call('generate', args).then(resolve, reject);
      });
    }
  }).then(() => {
    this.emit('deployBefore');

    if (!Array.isArray(config)) config = [config];
    return config;
  }).each(item => {
    if (!item.type) return;

    const { type } = item;

    if (!deployers[type]) {
      this.log.error('Deployer not found: %s', magenta(type));
      return;
    }

    this.log.info('Deploying: %s', magenta(type));

    return Reflect.apply(deployers[type], this, [Object.assign({}, item, args)]).then(() => {
      this.log.info('Deploy done: %s', magenta(type));
    });
  }).then(() => {
    this.emit('deployAfter');
  });
}

module.exports = deployConsole;
