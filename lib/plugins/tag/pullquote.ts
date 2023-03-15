/**
* Pullquote tag
*
* Syntax:
*   {% pullquote [class] %}
*   Quote string
*   {% endpullquote %}
*/
export = ctx => function pullquoteTag(args, content) {
  args.unshift('pullquote');

  const result = ctx.render.renderSync({text: content, engine: 'markdown'});

  return `<blockquote class="${args.join(' ')}">${result}</blockquote>`;
};
