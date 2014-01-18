/**
* Raw tag
*
* Syntax:
*   {% rawblock %}
*   Unescaped string
*   {% endrawblock %}
*/

module.exports = function(args, content){
  return content;
};