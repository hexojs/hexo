var ejs = require('ejs'),
  extend = require('../../extend'),
  filter = extend.filter.list(),
  _ = require('underscore');

_.each(filter, function(val, key){
  ejs.filters[key] = val;
});

extend.renderer.register('ejs', 'html', function(file, content, locals){
  if (file) locals = _.extend(locals, {filename: file});
  return ejs.render(content, locals);
}, true);