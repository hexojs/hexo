var _ = require('underscore'),
  config = hexo.config && hexo.config.exclude_generator ? hexo.config.exclude_generator : [],
  generator = ['home', 'post', 'page', 'category', 'tag', 'archive'];

if (!config){
  config = [];
} else if (!_.isArray(config)){
  config = [config.toString()];
}

_.each(generator, function(item){
  if (_.indexOf(config, item) === -1) require('./' + item);
});