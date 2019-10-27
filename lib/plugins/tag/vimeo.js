'use strict';

const { htmlTag } = require('hexo-util');

/**
* Vimeo tag
*
* Syntax:
*   {% vimeo video_id %}
*/

function vimeoTag(id) {
  const url = 'https://player.vimeo.com/video/' + id;

  const iframeTag = htmlTag('iframe', {
    src: url,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', { class: 'video-container' }, iframeTag, false);
}

module.exports = vimeoTag;
