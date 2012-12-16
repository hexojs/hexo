var _ = require('underscore');

var alias = {
  js: 'javascript',
  jscript: 'javascript',
  html: 'xml',
  htm: 'xml',
  coffee: 'coffeescript',
  yml: 'yaml',
  pl: 'perl',
  ru: 'ruby',
  rb: 'ruby'
};

var keys = Object.keys(alias);

var defaults = {
  gutter: true,
  first_line: 1,
  lang: '',
  caption: ''
};

module.exports = function(raw, options){
  var options = _.extend(_.clone(defaults), options),
    hljs = require('highlight.js');

  hljs.tabReplace = options.tab;

  if (!options.lang){
    var compiled = hljs.highlightAuto(raw).value;
  } else if (options.lang === 'plain'){
    var compiled = raw;
  } else {
    var lang = options.lang.toLowerCase();

    if (keys.indexOf(lang) !== -1) lang = alias[lang];

    try {
      var compiled = hljs.highlight(lang, raw).value;
    } catch (e){
      var compiled = hljs.highlightAuto(raw).value;
    }
  }

  var lines = compiled.split('\n'),
    numbers = '',
    content = '',
    firstLine = options.first_line;

  _.each(lines, function(item, i){
    numbers += '<div class="line-number">' + (i + firstLine) + '</div>';
    content += item ? '<div class="line">' + item + '</div>' : '<br>';
  });

  if (options.gutter){
    var result = '<figure class="highlight">'+
      (options.caption ? '<figcaption>' + options.caption + '</figcaption>' : '') +
      '<table>'+
      '<tr>'+
      '<td class="gutter"><pre><code>' + numbers + '</code></pre></td>'+
      '<td class="code"><pre><code>' + content + '</code></pre></td>'+
      '</tr>'+
      '</table>'+
      '</figure>';
  } else {
    var result = content;
  }

  return result;
};