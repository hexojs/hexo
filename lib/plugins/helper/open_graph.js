var _ = require('lodash'),
  cheerio = require('cheerio'),
  util = require('../../util'),
  htmlTag = util.html_tag,
  format = util.format;

var metaTag = function(name, content){
  var data = {};

  switch (name.split(':')[0]){
    case 'og':
    case 'fb':
      data.property = name;
      break;

    default:
      data.name = name;
  }

  data.content = content;

  return htmlTag('meta', data) + '\n';
};

module.exports = function(options){
  var page = this.page,
    config = this.config || hexo.config,
    content = page.content,
    images = page.photos || [];

  var description = page.description || '';

  if (!description){
    if (page.excerpt){
      description = format.stripHtml(page.excerpt);
    } else if (page.content){
      description = format.stripHtml(content);
    } else if (config.description){
      description = config.description;
    }
  }

  description = description.substring(0, 200).replace(/^\s+|\s+$/g, '')
    .replace(/\"/g, '\'')
    .replace(/\>/g, "&amp;");

  if (!images.length && content){
    var $ = cheerio.load(content);

    $('img').each(function(){
      var src = $(this).attr('src');
      if (src) images.push(src);
    });
  }

  var data = _.extend({
    title: page.title || config.title,
    type: this.is_post() ? 'article' : 'website',
    url: this.url,
    image: images,
    site_name: config.title,
    description: description,
    twitter_card: 'summary',
    twitter_id: '',
    twitter_site: '',
    google_plus: '',
    fb_admins: '',
    fb_app_id: ''
  }, options);

  var str = '';

  str += metaTag('description', data.description);
  str += metaTag('og:type', data.type);
  str += metaTag('og:title', data.title);
  str += metaTag('og:url', data.url);
  str += metaTag('og:site_name', data.site_name);
  str += metaTag('og:description', data.description);

  images.forEach(function(image){
    str += metaTag('og:image', image);
  });

  str += metaTag('twitter:card', data.twitter_card);
  str += metaTag('twitter:title', data.title);
  str += metaTag('twitter:description', data.description);

  if (data.twitter_id){
    var twitterId = data.twitter_id;
    if (twitterId[0] !== '@') twitterId = '@' + twitterId;

    str += metaTag('twitter:creator', twitterId);
  }

  if (data.twitter_site){
    str += metaTag('twitter:site', data.twitter_site);
  }

  if (data.google_plus){
    str += htmlTag('link', {rel: 'publisher', href: data.google_plus}) + '\n';
  }

  if (data.fb_admins){
    str += metaTag('fb:admins', data.fb_admins);
  }

  if (data.fb_app_id){
    str += metaTag('fb:app_id', data.fb_app_id);
  }

  return str;
};