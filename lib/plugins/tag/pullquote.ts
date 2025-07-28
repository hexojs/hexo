import type Hexo from '../../hexo';

/**
* Pullquote tag
*
* Syntax:
*   {% pullquote [class] %}
*   Quote string
*   {% endpullquote %}
*/
const pullquote = (ctx: Hexo) => function pullquoteTag(args: string[], content: string) {
  args.unshift('pullquote');

  const result = ctx.render.renderSync({text: content, engine: 'markdown'});

  return `<blockquote class="${args.join(' ')}">${result}</blockquote>`;
};

// For ESM compatibility
export default pullquote;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = pullquote;
  // For ESM compatibility
  module.exports.default = pullquote;
}
