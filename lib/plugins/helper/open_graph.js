var _ = require('lodash'),
  util = require('../../util'),
  htmlTag = util.html_tag,
  format = util.format;

var rCover = /<img([\s\S]*?)src="(.+?)"([\s\S]*?)>/;

var metaTag = function(name, content){
  return htmlTag('meta', {name: name, content: content});
};

module.exports = function(options){
  var page = this.page,
    content = page.content,
    cover = page.photos ? page.photos[0] : '';

  var description = page.description || '';

  if (!description){
    if (page.excerpt) description = format.strip_html(page.excerpt);
    if (page.content) description = format.strip_html(content);
  }

  description = description.substring(0, 200).replace(/^\s+|\s+$/g, '');

  if (!cover && rCover.test(content)){
    cover = content.match(rCover)[2];
  }

  var data = _.extend({
    title: page.title,
    type: 'blog',
    url: this.url,
    image: cover,
    site_name: this.config.title,
    description: description,
    twitter_card: 'summary',
    twitter_id: '',
    google_plus: '',
    fb_admins: ''
  }, options);

  var str = [];

  str.push(metaTag('og:type', data.type));
  str.push(metaTag('og:title', data.title));
  str.push(metaTag('og:url', data.url));
  str.push(metaTag('og:image', data.image));
  str.push(metaTag('og:site_name', data.site_name));
  str.push(metaTag('og:description', data.description));
  str.push(metaTag('twitter:card', data.twitter_card));

  if (data.twitter_id){
    str.push(metaTag('twitter:creator', data.twitter_id));
  }

  if (data.google_plus){
    str.push(htmlTag('link', {rel: 'publisher', href: data.google_plus}));
  }

  if (data.fb_admins){
    str.push(metaTag('fb:admins', data.fb_admins));
  }

  return str.join('\n');
};