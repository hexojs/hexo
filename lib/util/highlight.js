var hljs = require('highlight.js'),
  _ = require('underscore');

module.exports = function(code, lang, caption){
  if (lang){
    var lang = lang.toLowerCase();

    switch (lang){
      case 'js':
        lang = 'javascript';
        break;

      case 'html':
        lang = 'xml';
        break;

      case 'yml':
        lang = 'yaml';
        break;

      case 'pl':
        lang = 'perl';
        break;

      case 'ru':
        lang = 'ruby';
        break;
    }

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