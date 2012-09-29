var util = require('../util'),
  file = util.file,
  extend = require('../extend'),
  xml = require('jstoxml'),
  _ = require('underscore');

extend.generator.register(function(locals, render, callback){
  var publicDir = hexo.public_dir,
    config = hexo.config,
    content = [];

  var arr = [].concat(locals.posts.toArray(), locals.pages.toArray()).sort(function(a, b){
    return b.updated - a.updated;
  });

  _.each(arr, function(item){
    content.push({
      url: {
        loc: config.url + item.permalink,
        lastmod: item.updated.toDate().toISOString()
      }
    });
  });

  var result = xml.toXML({
    _name: 'urlset',
    _attrs: {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
    },
    _content: content
  }, {header: true, indent: '  '});

  file.write(publicDir + 'sitemap.xml', result, callback);
});