/**
* Pullquote tag
*
* Syntax:
*   {% pullquote [class] %}
*   Quote string
*   {% endpullquote %}
*/

function pullquoteTag(args, content){
  var className = args.length ? ' ' + args.join(' ') : '',
    out = '';

  out += '<escape><blockquote class="pullquote' + className + '"></escape>\n\n';
  out += content + '\n\n';
  out += '<escape></blockquote></escape>\n';

  return out;
}

module.exports = pullquoteTag;