var rExcerpt = /<!--\s*more\s*-->/;

function excerptFilter(data){
  data.content = data.content.replace(rExcerpt, function(){
    return '<a id="more"></a>';
  });
}

module.exports = excerptFilter;