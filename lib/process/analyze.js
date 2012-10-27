var extend = require('../extend'),
  util = require('../util'),
  titlecase = util.titlecase,
  Taxonomy = require('../model').Taxonomy,
  _ = require('underscore'),
  config;

var regex = {
  excerpt: /<!--\s*more\s*-->/
};

var capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

var execute = function(item){
  if (!config) config = hexo.config;

  var content = item.content;

  /*
  paranoid-auto-spacing by gibuloto
  https://github.com/gibuloto/paranoid-auto-spacing

  英文、數字、符號 ([a-z0-9~!@#&;=_\$\%\^\*\-\+\,\.\/(\\)\?\:\'\"\[\]\(\)])
  中文 ([\u4E00-\u9FFF])
  日文 ([\u3040-\u30FF])
  */
  if (config.auto_spacing){
    content = content
      .replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-z0-9@#&;=_\[\$\%\^\*\-\+\(\/])/ig, '$1 $2')
      .replace(/([a-z0-9#!~&;=_\]\,\.\:\?\$\%\^\*\-\+\)\/])([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $2');
  }

  if (config.titlecase){
    item.title = titlecase(item.title);
  }

  if (content.match(regex.excerpt)){
    item.content = content.replace(regex.excerpt, '<span id="more"></span>');
    item.excerpt = content.split(regex.excerpt)[0];
  } else {
    item.content = content;
  }

  return item;
};

extend.process.register(function(locals, callback){
  var cats = {},
    tags = {};

  console.log('Analyzing source files.');

  locals.posts = locals.posts.sort('date', -1);
  locals.pages = locals.pages.sort('date', -1);

  locals.posts.each(function(item, i){
    if (item.categories){
      _.each(item.categories, function(cat){
        if (cats.hasOwnProperty(cat.name)){
          cats[cat.name].push(item);
        } else {
          var newCat = locals.posts.slice(i, i + 1);
          newCat.permalink = cat.permalink;
          cats[cat.name] = newCat;
        }
      });
    }

    if (item.tags){
      _.each(item.tags, function(tag){
        if (tags.hasOwnProperty(tag.name)){
          tags[tag.name].push(item);
        } else {
          var newTag = locals.posts.slice(i, i + 1);
          newTag.permalink = tag.permalink;
          tags[tag.name] = newTag;
        }
      });
    }

    locals.posts[i] = execute(item);
  });

  locals.pages.each(function(item, i){
    locals.pages[i] = execute(item);
  });

  locals.categories = new Taxonomy(cats).sort('name');
  locals.tags = new Taxonomy(tags).sort('name');

  callback(null, locals);
});