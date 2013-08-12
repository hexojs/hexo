var r = /<!--\s*more\s*-->/g;

module.exports = function(data){
  var content = data.content;

  if (regex.test(content)){
    data.content = content.replace(regex, function(match, index){
      data.excerpt = content.substring(0, index);
      return '<a id="more"></a>';
    });
  } else {
    data.excerpt = '';
  }

  return data;
};