/**
 * Vimeo tag
 *
 * Syntax:
 *   {% vimeo video_id %}
 */

module.exports = function(args, content){
  var id = args[0];

  return '<div class="video-container"><iframe src="http://player.vimeo.com/video/' + id + '" width="560" height="315" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>';
};