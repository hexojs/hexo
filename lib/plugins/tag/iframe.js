'use strict';

/**
* Iframe tag
*
* Syntax:
*   {% iframe url [width] [height] %}
*/

function iframeTag(args, content){
  var url = args[0];
  var width = args[1] && args[1] !== 'default' ? args[1] : '100%';
  var height = args[2] && args[2] !== 'default' ? args[2] : '300';

  return '<iframe src="' + url + '" width="' + width + '" height="' + height + '" frameborder="0" allowfullscreen></iframe>';
}

module.exports = iframeTag;