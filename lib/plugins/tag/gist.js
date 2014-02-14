/**
* Gist tag
*
* Syntax:
*   {% gist gist_id [filename] %}
*/

module.exports = function(args, content){
  var id = args.shift(),
    file = args.length ? '?file=' + args[0] : '';

  return '<script src="https://gist.github.com/' + id + '.js' + file + '"></script>';
};