// http://tools.ietf.org/html/rfc3986#section-2.2
// http://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
module.exports = function(str, changeCase){
  changeCase = changeCase || 0;

  var str = str.toString().toLowerCase()
    .replace(/\s/g, '-')
    .replace(/:|\/|\?|#|\[|\]|@|!|\$|&|'|"|\(|\)|\*|\+|,|;|=|\\|%|<|>|\./g, '');

  if (changeCase == 1){
    str = str.toLowerCase();
  } else if (changeCase == 2){
    str = str.toUpperCase();
  }

  return str;
};
