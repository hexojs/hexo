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

  return '<blockquote class="pullquote' + className + '"><p>' + content + '</p></blockquote>';
};