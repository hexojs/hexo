var extend = require('../../extend'),
  _ = require('lodash'),
  urlConfig = hexo.config.url;

extend.helper.register('search_form', function(options){
  var defaults = {
    class: 'search-form',
    text: 'Search',
    button: false
  };

  options = _.extend(defaults, options);

  return '<form action="//google.com/search" method="get" accept-charset="UTF-8" class="' + options.class + '">' +
    '<input type="text" name="q" results="0" class="' + options.class + '-input"' + (options.text ? ' placeholder="' + options.text + '"' : '') + '>' +
    (options.button ? '<input type="submit" value="' + (_.isString(options.button) ? options.button : options.text) + '" class="' + options.class + '-submit">' : '') +
    '<input type="hidden" name="q" value="site:' + urlConfig + '">' +
    '</form>';
});