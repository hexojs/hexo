'use strict';

/**
* Pullquote tag
*
* Syntax:
*   {% pullquote [class] %}
*   Quote string
*   {% endpullquote %}
*/
module.exports = ctx => function pullquoteTag(args, content) {
  let result = '';

  args.unshift('pullquote');

  result += `<blockquote class="${args.join(' ')}">`;
  result += ctx.render.renderSync({text: content, engine: 'markdown'});
  result += '</blockquote>';

  return result;
};
