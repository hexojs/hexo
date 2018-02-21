'use strict';

/**
* jsFiddle tag
*
* Syntax:
*   {% jsfiddle shorttag [tabs] [skin] [height] [width] %}
*/

function jsfiddleTag(args, content) {
  const id = args[0];
  const tabs = args[1] && args[1] !== 'default' ? args[1] : 'js,resources,html,css,result';
  const skin = args[2] && args[2] !== 'default' ? args[2] : 'light';
  const width = args[3] && args[3] !== 'default' ? args[3] : '100%';
  const height = args[4] && args[4] !== 'default' ? args[4] : '300';

  return `<iframe scrolling="no" width="${width}" height="${height}" src="//jsfiddle.net/${id}/embedded/${tabs}/${skin}" frameborder="0" allowfullscreen></iframe>`;
}

module.exports = jsfiddleTag;
