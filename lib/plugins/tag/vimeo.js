'use strict';

/**
* Vimeo tag
*
* Syntax:
*   {% vimeo video_id %}
*/

function vimeoTag(args, content) {
  var id = args[0];

  return '<div class="video-container"><iframe src="//player.vimeo.com/video/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
}

module.exports = vimeoTag;
