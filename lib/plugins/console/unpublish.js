'use strict';

const tildify = require('tildify');
const { magenta } = require('picocolors');

function unPublishConsole(args) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['unpublish']});
  }

  return this.post.unpublish({
    slug: args._.pop(),
    layout: 'draft' // assumes only published posts to be reverteds
  }, args.r || args.replace).then(post => {
    this.log.info('Unpublished: %s', magenta(tildify(post.path)));
  });
}

module.exports = unPublishConsole;
