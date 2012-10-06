var hljs = require('highlight.js');

module.exports = function(code, lang, caption){
  switch (lang){
    case 'js':
      lang = 'javascript';
      break;

    case 'html':
      lang = 'xml';
      break;
  }

  try {
    var compiled = hljs.highlight(lang, code).value;
  } catch (e){
    var compiled = hljs.highlightAuto(code).value;
  }

  var lines = compiled.split('\n'),
    numbers = code = '',
    current = 1;

  for (var i=0, len=lines.length; i<len; i++){
    var line = lines[i];
    if (line){
      numbers += '<div class="line-number">' + current + '</div>';
      code += '<div class="line">' + line + '</div>';
      current++;
    }
  }

  var result = '<figure class="highlight">'+
    (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
    '<table>'+
    '<tr>'+
    '<td class="gutter"><pre>' + numbers + '</pre></td>'+
    '<td class="code"><pre>' + code + '</pre></td>'+
    '</tr>'+
    '</table>'+
    '</figure>';

  return result;
};