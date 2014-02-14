/**
* jsFiddle tag
*
* Syntax:
*   {% jsfiddle shorttag [tabs] [skin] [height] [width] %}
*/

module.exports = function(args, content){
  var id = args[0],
    tabs = args[1] && args[1] !== 'default' ? args[1] : 'js,resources,html,css,result',
    skin = args[2] && args[2] !== 'default' ? args[2] : 'light',
    width = args[3] && args[3] !== 'default' ? args[3] : '100%',
    height = args[4] && args[4] !== 'default' ? args[4] : '300';

  return '<iframe width="' + width + '" height="' + height + '" src="http://jsfiddle.net/' + id + '/embedded/' + tabs + '/' + skin + '" frameborder="0" allowfullscreen></iframe>';
};