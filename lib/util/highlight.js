var hljs = require('highlight.js'),
  _ = require('lodash');

hljs.configure({
  classPrefix: ''
});

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
  rb: 'ruby',
  csharp: 'cs'
};

var keys = Object.keys(alias);

/**
* Highlights a code block.
*
* See [highlight.js](http://highlightjs.org/)
*
* @method highlight
* @param {String} str
* @param {Object} [options]
*   @param {Boolean} [options.gutter=true] Displays line numbers. Only available when `options.wrap` is true
*   @param {Boolean} [options.wrap=true] Wraps code block with a table
*   @param {Number} [options.first_line=1] The first line number
*   @param {String} [options.lang] Language. Program will decide the language automatically if not defined.
*   @param {String} [options.caption] Caption.
*   @param {String} [options.tab] Tab replacement
* @return {String}
* @for util
* @static
*/

module.exports = function(str, options){
  options = _.extend({
    gutter: true,
    wrap: true,
    first_line: 1,
    lang: '',
    caption: '',
    tab: ''
  }, options);

  if (options.tab){
    str = str.replace(/\n(\t+)/g, function(match, tabs){
      var result = '\n';

      for (var i = 0, len = tabs.length; i < len; i++){
        result += options.tab;
      }

      return result;
    });
  }

  var compiled = '';

  if (!options.lang){
    compiled = hljs.highlightAuto(str).value;
  } else if (options.lang === 'plain'){
    compiled = str;
  } else {
    var lang = options.lang.toLowerCase();

    if (keys.indexOf(lang) !== -1) lang = alias[lang];

    try {
      compiled = hljs.highlight(lang, str).value;
    } catch (e){
      compiled = hljs.highlightAuto(str).value;
    }
  }

  if (!options.wrap) return compiled;

  var lines = compiled.split('\n'),
    numbers = '',
    content = '',
    firstLine = options.first_line;

  lines.forEach(function(item, i){
    numbers += '<div class="line">' + (i + firstLine) + '</div>';
    content += '<div class="line">' + item + '</div>';
  });

  var result = '<figure class="highlight' + (options.lang ? ' ' + options.lang : '') + '">' +
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