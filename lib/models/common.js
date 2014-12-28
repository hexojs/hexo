var rExcerpt = /<a id="more"><\/a>/;

exports.getExcerpt = function(content){
  return content.split(rExcerpt)[0].trim();
};

exports.getMore = function(content){
  return content.split(rExcerpt).slice(1).join('<a id="more"></a>').trim();
};