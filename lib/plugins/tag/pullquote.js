/**
* Pullquote tag
*
* Syntax:
*   {% pullquote [class] %}
*   Quote string
*   {% endpullquote %}
*/

module.exports = function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';

  return [
    '<escape><blockquote class="pullquote' + className + '"></escape>',
    content,
    '<escape></blockquote></escape>'
  ].join('');
};