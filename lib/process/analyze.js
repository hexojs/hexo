var extend = require('../extend'),
  _ = require('underscore'),
  words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'v.', 'via', 'vs', 'vs.'],
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
    var title = item.title.split(' ');

    item.title = _.map(title, function(word){
      if (_.indexOf(words, word) === -1) return capitalize(word);
      else return word;
    }).join(' ');
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

  locals.posts = locals.posts.sort('date', -1);
  locals.pages = locals.pages.sort('date', -1);

  locals.posts.each(function(item, i){
    if (item.categories){
      _.each(item.categories, function(cat){
        if (cats.hasOwnProperty(cat)){
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
        if (tags.hasOwnProperty(tag)){
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

  var catKeys = Object.keys(cats).sort(),
    tagKeys = Object.keys(tags).sort(),
    newCats = {},
    newTags = {};

  _.each(catKeys, function(item){
    newCats[item] = cats[item];
  });

  _.each(tagKeys, function(item){
    newTags[item] = tags[item];
  });

  locals.categories = newCats;
  locals.tags = newTags;

  console.log('Source file analyzed.');
  callback(null, locals);
});