import { htmlTag } from 'hexo-util';

const rUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\w]*))?)/;

/**
* Link tag
*
* Syntax:
*   {% link text url [external] [title] %}
*/

function linkTag(args: string[]) {
  let url = '';
  const text = [];
  let external = false;
  let title = '';
  let i = 0;
  const len = args.length;

  // Find link URL and text
  for (; i < len; i++) {
    const item = args[i];

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
    const shift = args[0];

    if (shift === 'true' || shift === 'false') {
      external = shift === 'true';
      args.shift();
    }

    title = args.join(' ');
  }

  const attrs = {
    href: url,
    title,
    target: external ? '_blank' : ''
  };

  return htmlTag('a', attrs, text.join(' '));
}

export = linkTag;
