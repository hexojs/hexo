/**
 * Pullquote tag
 *
 * Syntax:
 *   {% pullquote [class] %}
 *   Quote string
 *   {% endpullquote %}
 */

module.exports = function(args, content){
  var render = hexo.render,
    className = args.length ? ' ' + args.join(' ') : '';

  return '<blockquote class="pullquote' + className + '">' + render.renderSync({text: content, engine: 'markdown'}) + '</blockquote>';
};