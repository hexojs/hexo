'use strict';

function searchFormHelper(options){
  /* jshint validthis: true */
  options = options || {};

  var config = this.config;
  var className = options.class || 'search-form';
  var text = options.hasOwnProperty('text') ? options.text : 'Search';
  var button = options.button;

  return '<form action="//google.com/search" method="get" accept-charset="UTF-8" class="' + className + '">' +
    '<input type="search" name="q" results="0" class="' + className + '-input"' + (text ? ' placeholder="' + text + '"' : '') + '>' +
    (button ? '<button type="submit" class="' + className + '-submit">' + (typeof button === 'string' ? button : text) + '</button>' : '') +
    '<input type="hidden" name="q" value="site:' + config.url + '">' +
    '</form>';
}

module.exports = searchFormHelper;