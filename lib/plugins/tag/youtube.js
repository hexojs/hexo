'use strict';

const { htmlTag } = require('hexo-util');

/**
* Youtube tag
*
* Syntax:
*   {% youtube video_id, type, cookie %}
*/

function youtubeTag([id, type = 'video', cookie = true]) {
  if (typeof type === 'boolean') {
    cookie = type;
    type = 'video';
  }

  const ytLink = cookie ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
  const embed = type === 'video' ? '/embed/' : '/embed/videoseries?list=';

  const iframeTag = htmlTag('iframe', {
    src: ytLink + embed + id,
    frameborder: '0',
    loading: 'lazy',
    allowfullscreen: true
  }, '');

  return htmlTag('div', { class: 'video-container' }, iframeTag, false);
}

module.exports = youtubeTag;
