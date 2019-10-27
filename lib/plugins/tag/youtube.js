'use strict';

const { htmlTag } = require('hexo-util');

/**
* Youtube tag
*
* Syntax:
*   {% youtube video_id %}
*/

function youtubeTag(id) {
  const src = 'https://www.youtube.com/embed/' + id;

  const iframeTag = htmlTag('iframe', {
    src,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', { class: 'video-container' }, iframeTag, false);
}

module.exports = youtubeTag;
