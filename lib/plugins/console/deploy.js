'use strict';

const { exists } = require('hexo-fs');
const { underline, magenta } = require('chalk');

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

  const generateArgs = {...args};
  generateArgs.d = false;
  generateArgs.deploy = false;

  let promise;

  if (args.g || args.generate) {
    promise = this.call('generate', args);
  } else {
    promise = exists(this.public_dir).then(exist => {
      if (!exist) return this.call('generate', args);
    });
  }

  return promise.then(() => {
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

    return Reflect.apply(deployers[type], this, [{ ...item, ...args }]).then(() => {
      this.log.info('Deploy done: %s', magenta(type));
    });
  }).then(() => {
    this.emit('deployAfter');
  });
}

module.exports = deployConsole;
