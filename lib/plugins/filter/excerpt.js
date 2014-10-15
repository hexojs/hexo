var rExcerpt = /<!--\s*more\s*-->/g;

module.exports = function(data, callback){
  var content = data.content;

  if (rExcerpt.test(content)){
    data.content = content.replace(rExcerpt, function(match, index){
      data.excerpt = content.substring(0, index);
      data.more = content.substring(index, content.length - 1 - index);
      return '<a id="more"></a>';
    });
  } else {
    data.excerpt = '';
    data.more = content;
  }

  callback(null, data);
};