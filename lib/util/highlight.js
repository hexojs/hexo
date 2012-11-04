var hljs = require('highlight.js'),
  _ = require('underscore');

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

module.exports = function(code, lang, caption){
  if (lang){
    var lang = lang.toLowerCase();

    if (_.indexOf(keys, lang) !== -1) lang = alias[lang];

    try {
      var compiled = hljs.highlight(lang, code).value;
    } catch (e){
      var compiled = hljs.highlightAuto(code).value;
    }
  } else {
    var compiled = hljs.highlightAuto(code).value;
  }

  var lines = compiled.split('\n'),
    numbers = '',
    code = '';

  _.each(lines, function(item, i){
    numbers += '<div class="line-number">' + (i + 1) + '</div>';
    code += item ? '<div class="line">' + item + '</div>' : '<br>';
  });

  var result = '<figure class="highlight">'+
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
    '<table>'+
    '<tr>'+
    '<td class="gutter"><pre><code>' + numbers + '</code></pre></td>'+
    '<td class="code"><pre><code>' + code + '</code></pre></td>'+
    '</tr>'+
    '</table>'+
    '</figure>';

  return result;
};