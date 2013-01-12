var extend = require('../extend'),
  _ = require('underscore');

extend.console.register('version', 'Display verseion', {init: true}, function(args){
  console.log(require('../../package.json').version);
});