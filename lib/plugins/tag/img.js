var util = require('../../util'),
  htmlTag = util.html_tag;

var rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/,
  rMeta = /["']?([^"']+)?["']?\s*["']?([^"']+)?["']?/;

/**
* Image tag
*
* Syntax:
*   {% img [class names] /path/to/image [width] [height] [title text [alt text]] %}
*/

module.exports = function(args, content){
  var classes = [],
    src = '';

  // Find image URL and class name
  for (var i = 0, len = args.length; i < len; i++){
    var item = args[i];

    if (rUrl.test(item)){
      src = item;
      break;
    } else {
      if (item[0] === '/'){
        src = item;
        break;
      } else {
        classes.push(item);
      }
    }
  }

  // Delete image URL and class name from arguments
  args = args.slice(i + 1);

  // Find image width and height
  if (args.length){
    if (!/\D+/.test(args[0])){
      var width = args.shift();

      if (args.length && !/\D+/.test(args[0])){
        var height = args.shift();
      }
    }

    var meta = args.join(' ');
  }

  // Find image title and alt
  if (meta && rMeta.test(meta)){
    var match = meta.match(rMeta),
      title = match[1],
      alt = match[2];
  }

  var attrs = {
    src: src,
    class: classes.join(' '),
    width: width,
    height: height,
    title: title,
    alt: alt
  };

  return htmlTag('img', attrs);
};