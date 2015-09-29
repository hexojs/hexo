'use strict';

var tildify = require('tildify');
var chalk = require('chalk');

function publishConsole(args) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['publish']});
  }

  var self = this;

  return this.post.publish({
    slug: args._.pop(),
    layout: args._.length ? args._[0] : this.config.default_layout
  }, args.r || args.replace).then(function(post) {
    self.log.info('Published: %s', chalk.magenta(tildify(post.path)));
  });
}

module.exports = publishConsole;
