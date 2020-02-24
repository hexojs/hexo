'use strict';

const { htmlTag } = require('hexo-util');

/**
* Youtube tag
*
* Syntax:
*   {% youtube video_id, type %}
*/

function youtubeTag([id, type = 'video']) {
  let src;

  if (type === 'video') {
    src = 'https://www.youtube.com/embed/' + id;
  } else if (type === 'playlist') {
    src = 'https://www.youtube.com/embed/videoseries?list=' + id;
  }

  const iframeTag = htmlTag('iframe', {
    src,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', { class: 'video-container' }, iframeTag, false);
}

module.exports = youtubeTag;
