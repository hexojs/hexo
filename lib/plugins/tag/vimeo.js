'use strict';

/**
* Vimeo tag
*
* Syntax:
*   {% vimeo video_id [width] [height] %}
*/

function vimeoTag(args, content) {
  const video_id = args.shift();
  const width = args[0] || 640;
  const height = args[1] || 480;

  if (!args.length) {
    return `<div class="video-container" style="padding:56.25% 0 0 0;position:relative;">
    <iframe src="//player.vimeo.com/video/${video_id}?title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    </div>`;
  }
  return `<div class="video-container"><iframe src="//player.vimeo.com/video/${video_id}?title=0&byline=0&portrait=0" width="${width}" height="${height}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;
}

module.exports = vimeoTag;
