'use strict';

var urlFn = require('url');
var moment = require('moment');
var util = require('hexo-util');
var htmlTag = util.htmlTag;
var stripHTML = util.stripHTML;
var escapeHTML = util.escapeHTML;
var cheerio;

function meta(name, content, escape) {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  return htmlTag('meta', {
    name: name,
    content: content
  }) + '\n';
}

function og(name, content, escape) {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  return htmlTag('meta', {
    property: name,
    content: content
  }) + '\n';
}

function openGraphHelper(options) {
  options = options || {};

  if (!cheerio) cheerio = require('cheerio');

  var page = this.page;
  var config = this.config;
  var content = page.content;
  var images = options.image || options.images || page.photos || [];
  var description = options.description || page.description || page.excerpt || content || config.description;
  var keywords = page.keywords || (page.tags && page.tags.length ? page.tags : undefined) || config.keywords;
  var title = options.title || page.title || config.title;
  var type = options.type || (this.is_post() ? 'article' : 'website');
  var url = options.url || this.url;
  var siteName = options.site_name || config.title;
  var twitterCard = options.twitter_card || 'summary';
  var updated = options.updated !== false ? (options.updated || page.updated) : false;
  var result = '';

  if (!Array.isArray(images)) images = [images];

  if (description) {
    description = stripHTML(description).substring(0, 200)
      .trim() // Remove prefixing/trailing spaces
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/\n/g, ' '); // Replace new lines by spaces
  }

  if (!images.length && content) {
    images = images.slice();

    var $ = cheerio.load(content);

    $('img').each(function() {
      var src = $(this).attr('src');
      if (src) images.push(src);
    });
  }

  if (description) {
    result += meta('description', description, false);
  }

  if (keywords) {
    if (typeof keywords === 'string') {
      result += meta('keywords', keywords);
    } else if (keywords.length) {
      result += meta('keywords', keywords.map(function(tag) {
        return tag.name ? tag.name : tag;
      }).filter(function(keyword) {
        return !!keyword;
      }).join());
    }
  }

  result += og('og:type', type);
  result += og('og:title', title);
  result += og('og:url', url, false);
  result += og('og:site_name', siteName);
  if (description) {
    result += og('og:description', description, false);
  }

  images = images.map(function(path) {
    if (!urlFn.parse(path).host) {
      // resolve `path`'s absolute path relative to current page's url
      // `path` can be both absolute (starts with `/`) or relative.
      return urlFn.resolve(url || config.url, path);
    }

    return path;
  });

  images.forEach(function(path) {
    result += og('og:image', path, false);
  });

  if (updated) {
    if ((moment.isMoment(updated) || moment.isDate(updated)) && !isNaN(updated.valueOf())) {
      result += og('og:updated_time', updated.toISOString());
    }
  }

  result += meta('twitter:card', twitterCard);
  result += meta('twitter:title', title);
  if (description) {
    result += meta('twitter:description', description, false);
  }

  if (images.length) {
    result += meta('twitter:image', images[0], false);
  }

  if (options.twitter_id) {
    var twitterId = options.twitter_id;
    if (twitterId[0] !== '@') twitterId = '@' + twitterId;

    result += meta('twitter:creator', twitterId);
  }

  if (options.twitter_site) {
    result += meta('twitter:site', options.twitter_site, false);
  }

  if (options.google_plus) {
    result += htmlTag('link', {rel: 'publisher', href: options.google_plus}) + '\n';
  }

  if (options.fb_admins) {
    result += og('fb:admins', options.fb_admins);
  }

  if (options.fb_app_id) {
    result += og('fb:app_id', options.fb_app_id);
  }

  return result.trim();
}

module.exports = openGraphHelper;
