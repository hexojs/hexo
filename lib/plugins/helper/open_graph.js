'use strict';

const urlFn = require('url');
const moment = require('moment');
const { escapeHTML, htmlTag, stripHTML } = require('hexo-util');
let cheerio;

function meta(name, content, escape) {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  return `${htmlTag('meta', {
    name,
    content
  })}\n`;
}

function og(name, content, escape) {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  return `${htmlTag('meta', {
    property: name,
    content
  })}\n`;
}

function openGraphHelper(options = {}) {
  if (!cheerio) cheerio = require('cheerio');

  const { config, page } = this;
  const { content } = page;
  let images = options.image || options.images || page.photos || [];
  let description = options.description || page.description || page.excerpt || content || config.description;
  const keywords = page.keywords || (page.tags && page.tags.length ? page.tags : undefined) || config.keywords;
  const title = options.title || page.title || config.title;
  const type = options.type || (this.is_post() ? 'article' : 'website');
  const url = options.url || this.url;
  const siteName = options.site_name || config.title;
  const twitterCard = options.twitter_card || 'summary';
  const updated = options.updated !== false ? options.updated || page.updated : false;
  const language = options.language || page.lang || page.language || config.language;

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

    const $ = cheerio.load(content);

    $('img').each(function() {
      const src = $(this).attr('src');
      if (src) images.push(src);
    });
  }

  let result = '';

  if (description) {
    result += meta('description', description, false);
  }

  if (keywords) {
    if (typeof keywords === 'string') {
      result += meta('keywords', keywords);
    } else if (keywords.length) {
      result += meta('keywords', keywords.map(tag => {
        return tag.name ? tag.name : tag;
      }).filter(keyword => !!keyword).join());
    }
  }

  result += og('og:type', type);
  result += og('og:title', title);
  result += og('og:url', url, false);
  result += og('og:site_name', siteName);
  if (description) {
    result += og('og:description', description, false);
  }

  if (language) {
    result += og('og:locale', language, false);
  }

  images = images.map(path => {
    if (!urlFn.parse(path).host) {
      // resolve `path`'s absolute path relative to current page's url
      // `path` can be both absolute (starts with `/`) or relative.
      return urlFn.resolve(url || config.url, path);
    }

    return path;
  });

  images.forEach(path => {
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
    let twitterId = options.twitter_id;
    if (twitterId[0] !== '@') twitterId = `@${twitterId}`;

    result += meta('twitter:creator', twitterId);
  }

  if (options.twitter_site) {
    result += meta('twitter:site', options.twitter_site, false);
  }

  if (options.google_plus) {
    result += `${htmlTag('link', {rel: 'publisher', href: options.google_plus})}\n`;
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
