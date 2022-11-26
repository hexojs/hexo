'use strict';

const tildify = require('tildify');
const { magenta } = require('picocolors');

function publishConsole(args) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['publish']});
  }

  return this.post.publish({
    slug: args._.pop(),
    layout: args._.length ? args._[0] : this.config.default_layout
  }, args.r || args.replace).then(post => {
    this.log.info('Published: %s', magenta(tildify(post.path)));
  });
}

module.exports = publishConsole;
