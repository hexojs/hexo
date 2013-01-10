var extend = require('../extend'),
  Taxonomy = require('../model').Taxonomy,
  _ = require('underscore');

extend.processor.register(function(locals, callback){
  var cats = {},
    tags = {},
    total = locals.posts.length;

  locals.posts.each(function(item, i){
    if (item.categories){
      _.each(item.categories, function(cat){
        if (cats.hasOwnProperty(cat.name)){
          cats[cat.name].push(item);
        } else {
          var newCat = locals.posts.slice(i, i + 1);
          newCat.path = cat.path;
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
          newTag.path = tag.path;
          newTag.permalink = tag.permalink;
          tags[tag.name] = newTag;
        }
      });
    }

    if (i !== 0) item.prev = locals.posts[i - 1];
    if (i !== total) item.next = locals.posts[i + 1];
  });

  locals.categories = new Taxonomy(cats).sort('name');
  locals.tags = new Taxonomy(tags).sort('name');

  callback(null, locals);
});