var extend = require('../../extend'),
  _ = require('lodash'),
  format = require('util').format;

var regex = {
  url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/
};

/**
 * Hyperlink tag
 * syntax:
 *   {% link [text] url [open in new window] [title text] %}
 */
var link = function (args, content) {
  var text = '',
    url = '',
    openInNewWin = false,
    titleText = '',
    anchorTag = '',
    meta;

  _.each(args, function (item, idx) {
    if (!regex.url.test(item)){
      text += ' ' + item;
    } else {
      url = item;
      meta = args.slice(idx + 1);
      return false;
    }
  });

  if (meta.length){
    openInNewWin = !!meta.shift();
    titleText = meta.shift();
  }

  text || (text = url);
  titleText || (titleText = text);

  anchorTag = format('<a href="%s" title="%s">%s</a>', url, titleText, text);
  if (openInNewWin) {
    anchorTag = format('<a href="%s" title="%s" target="_blank">%s</a>', url, titleText, text);
  }

  return anchorTag;
};

extend.tag.register('a', link);
extend.tag.register('link', link);
extend.tag.register('anchor', link);