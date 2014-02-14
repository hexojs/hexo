/**
* Iframe tag
*
* Syntax:
*   {% iframe url [width] [height] %}
*/

module.exports = function(args, content){
  var url = args[0],
    width = args[1] && args[1] !== 'default' ? args[1] : '100%',
    height = args[2] && args[2] !== 'default' ? args[2] : '300';

  return '<iframe src="' + url + '" width="' + width + '" height="' + height + '" frameborder="0" allowfullscreen></iframe>';
};