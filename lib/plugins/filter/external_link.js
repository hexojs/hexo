var extend = require('../../extend'),
  config = hexo.config;

extend.filter.register('post', function(data){
  if (config.external_link){
    data.content = data.content.replace(/<a\s*([^>]+)\s*>([^<]*)<\/a>/g, function(match, attr, title){
      console.log(match);
      var href = attr.match(/href="(.*)"/);

      if (href && /^([a-z]+:)?\/{2}/.test(href[1]) && !/target="_blank"/.test(attr)){
        attr += ' target="_blank"';
      }

      return '<a ' + attr + '>' + title + '</a>';
    });
  }

  return data;
});