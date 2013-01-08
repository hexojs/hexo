var words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'v.', 'via', 'vs', 'vs.'];

var capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

module.exports = function(content){
  var arr = content.toString().split(' '),
    result = [];

  arr.forEach(function(item){
    item = item.toLowerCase();

    if (words.indexOf(item) === -1){
      result.push(capitalize(item));
    } else {
      result.push(item);
    }
  });

  return result.join(' ');
};