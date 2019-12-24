'use strict';

const { parse, resolve } = require('url');
const { isMoment, isDate } = require('moment');
const { prettyUrls, htmlTag, stripHTML, escapeHTML } = require('hexo-util');

const localeMap = {
  'en': 'en_US',
  'de': 'de_DE',
  'es': 'es_ES',
  'fr': 'fr_FR',
  'hu': 'hu_HU',
  'id': 'id_ID',
  'it': 'it_IT',
  'ja': 'ja_JP',
  'ko': 'ko_KR',
  'nl': 'nl_NL',
  'ru': 'ru_RU',
  'th': 'th_TH',
  'tr': 'tr_TR',
  'vi': 'vi_VN'
};
const localeRegex = new RegExp(Object.keys(localeMap).join('|'), 'i');

function meta(name, content) {
  return `${htmlTag('meta', {
    name,
    content
  })}\n`;
}

function og(name, content) {
  return `${htmlTag('meta', {
    property: name,
    content
  })}\n`;
}

function openGraphHelper(options = {}) {

  const { config, page } = this;
  const { content } = page;
  let images = options.image || options.images || page.photos || [];
  let description = options.description || page.description || page.excerpt || content || config.description;
  let keywords = page.keywords || (page.tags && page.tags.length ? page.tags : undefined) || config.keywords;
  const title = options.title || page.title || config.title;
  const type = options.type || (this.is_post() ? 'article' : 'website');
  const url = prettyUrls(options.url || this.url, config.pretty_urls);
  const siteName = options.site_name || config.title;
  const twitterCard = options.twitter_card || 'summary';
  const date = options.date !== false ? options.date || page.date : false;
  const updated = options.updated !== false ? options.updated || page.updated : false;
  let language = options.language || page.lang || page.language || config.language;
  const author = options.author || config.author;

  if (!Array.isArray(images)) images = [images];

  if (description) {
    description = escapeHTML(stripHTML(description).substring(0, 200)
      .trim() // Remove prefixing/trailing spaces
    ).replace(/\n/g, ' '); // Replace new lines by spaces
  }

  if (!images.length && content) {
    images = images.slice();

    if (content.includes('<img')) {
      let img;
      const imgPattern = /<img [^>]*src=['"]([^'"]+)([^>]*>)/gi;
      while ((img = imgPattern.exec(content)) !== null) {
        images.push(img[1]);
      }
    }

  }

  let result = '';

  if (description) {
    result += meta('description', description);
  }

  result += og('og:type', type);
  result += og('og:title', title);

  result += og('og:url', url);

  result += og('og:site_name', siteName);
  if (description) {
    result += og('og:description', description);
  }

  if (language) {
    if (language.length === 2) {
      language = language.replace(localeRegex, str => localeMap[str]);
      result += og('og:locale', language);
    } else if (language.length === 5) {
      const territory = language.slice(-2);
      const territoryRegex = new RegExp(territory.concat('$'));

      language = language.replace('-', '_').replace(territoryRegex, territory.toUpperCase());

      result += og('og:locale', language);
    }
  }

  images = images.map(path => {
    if (!parse(path).host) {
      // resolve `path`'s absolute path relative to current page's url
      // `path` can be both absolute (starts with `/`) or relative.
      return resolve(url || config.url, path);
    }

    return path;
  });

  images.forEach(path => {
    result += og('og:image', path);
  });

  if (date) {
    if ((isMoment(date) || isDate(date)) && !isNaN(date.valueOf())) {
      result += og('article:published_time', date.toISOString());
    }
  }

  if (updated) {
    if ((isMoment(updated) || isDate(updated)) && !isNaN(updated.valueOf())) {
      result += og('article:modified_time', updated.toISOString());
    }
  }

  if (author) {
    result += og('article:author', author);
  }

  if (keywords) {
    if (typeof keywords === 'string') keywords = keywords.split(',');

    keywords.map(tag => {
      return tag.name ? tag.name : tag;
    }).filter(Boolean).forEach(keyword => {
      result += og('article:tag', keyword);
    });
  }

  result += meta('twitter:card', twitterCard);

  if (images.length) {
    result += meta('twitter:image', images[0]);
  }

  if (options.twitter_id) {
    let twitterId = options.twitter_id;
    if (twitterId[0] !== '@') twitterId = `@${twitterId}`;

    result += meta('twitter:creator', twitterId);
  }

  if (options.twitter_site) {
    result += meta('twitter:site', options.twitter_site);
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
