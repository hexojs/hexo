/**
* Creates a snippet of HTML tag.
*
* **Examples:**
*
* ```
* html_tag('a', {href: 'http://www.google.com'}, 'Google');
* html_tag('img', {src: 'foo.jpg'});
* ```
*
* yields:
*
* ```
* <a href="http://www.google.com">Google</a>
* <img src="foo.jpg">
* ```
*
* @method html_tag
* @param {String} tag
* @param {Object} attrs
* @param {String} [text]
* @return {String}
* @for util
* @static
*/

module.exports = function(tag, attrs, text){
  var result = '<' + tag;

  for (var i in attrs){
    if (attrs[i]) result += ' ' + i + '="' + attrs[i] + '"';
  }

  result += text == null ? '>' : '>' + text + '</' + tag + '>';

  return result;
};