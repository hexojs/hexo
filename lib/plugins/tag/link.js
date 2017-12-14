'use strict';

var util = require('hexo-util');
var htmlTag = util.htmlTag;

var rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/; // eslint-disable-line no-useless-escape

/**
* Link tag
*
* Syntax:
*   {% link text url [external] [title] %}
*/

function linkTag(args, content) {
  var url = '';
  var text = [];
  var external = false;
  var title = '';
  var item = '';
  var i = 0;
  var len = args.length;

  // Find link URL and text
  for (; i < len; i++) {
    item = args[i];

    if (rUrl.test(item)) {
      url = item;
      break;
    } else {
      text.push(item);
    }
  }

  // Delete link URL and text from arguments
  args = args.slice(i + 1);

  // Check if the link should be open in a new window
  // and collect the last text as the link title
  if (args.length) {
    var shift = args[0];

    if (shift === 'true' || shift === 'false') {
      external = shift === 'true';
      args.shift();
    }

    title = args.join(' ');
  }

  var attrs = {
    href: url,
    title: title,
    target: external ? '_blank' : ''
  };

  return htmlTag('a', attrs, text.join(' '));
}

module.exports = linkTag;
