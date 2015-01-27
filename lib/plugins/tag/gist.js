'use strict';

/**
* Gist tag
*
* Syntax:
*   {% gist gist_id [filename] %}
*/

function gistTag(args, content){
  var id = args.shift();
  var file = args.length ? '?file=' + args[0] : '';

  return '<script src="//gist.github.com/' + id + '.js' + file + '"></script>';
}

module.exports = gistTag;