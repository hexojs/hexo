'use strict';

/**
* Bilibili tag
*
* Syntax:
*   {% bili video_id %}
*/

function biliTag(args, content) {
  var src = args[0];

  return '<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;"><iframe src="' + src + '" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;"></iframe></div>';
}

module.exports = biliTag;
