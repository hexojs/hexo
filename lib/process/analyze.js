var extend = require('../extend'),
  _ = require('underscore');

extend.process.register(function(locals, callback){
  var cats = {},
    tags = {};

  locals.posts = locals.posts.sort('date', -1);
  locals.pages = locals.pages.sort('date', -1);

  _.each(locals.posts.toArray(), function(item, i){
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
  callback();
});