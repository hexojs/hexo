var ejs = require('ejs'),
  extend = require('../extend'),
  _ = require('underscore');

extend.renderer.register('ejs', function(file, content, locals){
  if (file) locals = _.extend(locals, {filename: file});
  return ejs.render(content, locals);
}, true);