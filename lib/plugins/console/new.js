'use strict';

const tildify = require('tildify');
const chalk = require('chalk');

const reservedKeys = {
  _: true,
  title: true,
  layout: true,
  slug: true,
  s: true,
  path: true,
  p: true,
  replace: true,
  r: true,
  // Global options
  config: true,
  debug: true,
  safe: true,
  silent: true
};

function newConsole(args) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['new']});
  }

  const data = {
    title: args._.pop(),
    layout: args._.length ? args._[0] : this.config.default_layout,
    slug: args.s || args.slug,
    path: args.p || args.path
  };

  const keys = Object.keys(args);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    if (!reservedKeys[key]) data[key] = args[key];
  }

  return this.post.create(data, args.r || args.replace).then(post => {
    this.log.info('Created: %s', chalk.magenta(tildify(post.path)));
  });
}

module.exports = newConsole;
