var extend = require('../../extend'),
  regex = /<!--\s*more\s*-->/;

extend.filter.register('post', function(data){
  var content = data.content;

  if (regex.test(content)){
    data.content = content.replace(regex, function(match, index){
      data.excerpt = index;
      return '<a name="more"></a>';
    });
  } else {
    data.excerpt = content.length;
  }

  return data;
});