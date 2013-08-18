/**
 * Raw tag
 *
 * Syntax:
 *   {% raw %}
 *   Unescaped string
 *   {% endraw %}
 */

module.exports = function(args, content){
  return content;
};