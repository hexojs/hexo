'use strict';

/**
* Raw tag
*
* Syntax:
*   {% rawblock %}
*   Unescaped string
*   {% endrawblock %}
*/

function rawTag(args, content){
  return content;
}

module.exports = rawTag;