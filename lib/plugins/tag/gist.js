'use strict';

/**
* Gist tag
*
* Syntax:
*   {% gist gist_id [filename] %}
*/

function gistTag(args, content) {
  const id = args.shift();
  const file = args.length ? `?file=${args[0]}` : '';

  return `<script src="//gist.github.com/${id}.js${file}"></script>`;
}

module.exports = gistTag;
