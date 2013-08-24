/**
 * Module dependencies.
 */

var hljs = require('highlight.js'),
  _ = require('lodash');

/**
 * Alias
 */

var alias = {
  js: 'javascript',
  jscript: 'javascript',
  html: 'xml',
  htm: 'xml',
  coffee: 'coffeescript',
  'coffee-script': 'coffeescript',
  yml: 'yaml',
  pl: 'perl',
  ru: 'ruby',
  rb: 'ruby'
};

var keys = Object.keys(alias);

/**
 * Highlight the given `str`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

module.exports = function(str, options){
  var defaults = {
    gutter: true,
    wrap: true,
    first_line: 1,
    lang: '',
    caption: '',
    tab: ''
  };

  var options = _.extend(defaults, options);

  if (options.tab){
    str = str.replace(/\n(\t+)/g, function(match, tabs){
      var result = '\n';

      for (var i=0, len=tabs.length; i<len; i++){
        result += options.tab;
      }

      return result;
    });
  }

  if (!options.lang){
    var compiled = hljs.highlightAuto(str).value;
  } else if (options.lang === 'plain'){
    var compiled = str;
  } else {
    var lang = options.lang.toLowerCase();

    if (keys.indexOf(lang) !== -1) lang = alias[lang];

    try {
      var compiled = hljs.highlight(lang, str).value;
    } catch (e){
      var compiled = hljs.highlightAuto(str).value;
    }
  }

  if (!options.wrap) return compiled;

  var lines = compiled.split('\n'),
    numbers = '',
    content = '',
    firstLine = options.first_line;

  lines.forEach(function(item, i){
    numbers += (i + firstLine) + '\n';
    content += item + '\n';
  });

  var result = '<figure class="highlight' + (options.lang ? ' lang-' + options.lang : '') + '">' +
    (options.caption ? '<figcaption>' + options.caption + '</figcaption>' : '');

  if (options.gutter){
    result += '<table><tr>' +
      '<td class="gutter"><pre>' + numbers + '</pre></td>' +
      '<td class="code"><pre>' + content + '</pre></td>' +
      '</tr></table>';
  } else {
    result += '<pre>' + content + '</pre>';
  }

  result += '</figure>';

  return result;
};