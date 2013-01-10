var extend = require('../extend'),
  _ = require('underscore');

extend.console.register('version', 'Display verseion', function(args){
  console.log(require('../../package.json').version);
});