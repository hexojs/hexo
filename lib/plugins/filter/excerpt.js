var extend = require('../../extend'),
  regex = /<!--\s*more\s*-->/;

extend.filter.register('post', function(data){
  var content = data.content;

  if (regex.test(content)){
    data.content = content.replace(regex, function(match, index){
      data.excerpt = index;
      return '<a id="more"></a>';
    });
  } else {
    data.excerpt = 0;
  }

  return data;
});
