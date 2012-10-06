var hljs = require('highlight.js');

module.exports = function(code, caption){
  var highlighted = hljs.highlightAuto(code).value,
    lines = highlighted.split('\n'),
    numbers = code = '';

  for (var i=0, len=lines.length; i<len; i++){
    numbers += '<div class="line-number">' + (i + 1) + '</div>';
    code += '<div class="line">' + lines[i] + '</div>';
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