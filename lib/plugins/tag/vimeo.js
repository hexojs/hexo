'use strict';

/**
* Vimeo tag
*
* Syntax:
*   {% vimeo video_id %}
*/

function vimeoTag(id) {
  return `<div class="video-container"><iframe src="https://player.vimeo.com/video/${id}" frameborder="0" loading="lazy" allowfullscreen></iframe></div>`;
}

module.exports = vimeoTag;
