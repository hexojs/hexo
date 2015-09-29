'use strict';

/**
* Youtube tag
*
* Syntax:
*   {% youtube video_id %}
*/

function youtubeTag(args, content) {
  var id = args[0];

  return '<div class="video-container"><iframe src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>';
}

module.exports = youtubeTag;
