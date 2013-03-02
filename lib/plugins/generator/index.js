var _ = require('lodash'),
  config = hexo.config && hexo.config.exclude_generator ? hexo.config.exclude_generator : [],
  generator = ['home', 'post', 'page', 'category', 'tag', 'archive'];

if (!config){
  config = [];
} else if (!Array.isArray(config)){
  config = [config.toString()];
}

generator.forEach(function(item){
  if (config.indexOf(item) === -1) require('./' + item);
});