'use strict';

const { htmlTag } = require('hexo-util');

/**
* Youtube tag
*
* Syntax:
*   {% youtube video_id %}
*/

function youtubeTag(id) {
  const url = 'https://www.youtube.com/embed/' + id;

  const iframeTag = htmlTag('iframe', {
    src: url,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', { class: 'video-container' }, iframeTag, false);
}

module.exports = youtubeTag;
