import { isMoment, isDate, Moment } from 'moment';
import { encodeURL, prettyUrls, stripHTML, escapeHTML } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

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

const localeToTerritory = moize.shallow(str => {
  if (str.length === 2 && localeMap[str]) return localeMap[str];

  if (str.length === 5) {
    let territory = [];
    if (str.includes('-')) {
      territory = str.split('-');
    } else {
      territory = str.split('_');
    }

    if (territory.length === 2) return territory[0].toLowerCase() + '_' + territory[1].toUpperCase();
  }
});

const meta = (name: string, content: string | URL, escape?: boolean) => {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  if (content) return `<meta name="${name}" content="${content}">\n`;
  return `<meta name="${name}">\n`;
};

const og = (name: string, content?: string, escape?: boolean) => {
  if (escape !== false && typeof content === 'string') {
    content = escapeHTML(content);
  }

  if (content) return `<meta property="${name}" content="${content}">\n`;
  return `<meta property="${name}">\n`;
};

interface Options {
  image?: string;
  images?: string[];
  description?: string;
  title?: string;
  type?: string;
  url?: string;
  site_name?: string;
  twitter_card?: string;
  date?: Moment | Date | false;
  updated?: Moment | Date | false;
  language?: string;
  author?: string;
  twitter_image?: string;
  twitter_id?: string;
  twitter_site?: string;
  fb_admins?: string;
  fb_app_id?: string;
}

function openGraphHelper(this: LocalsType, options: Options = {}) {
  const { config, page } = this;
  const { content } = page;
  let images = options.image || options.images || page.photos || [];
  let description = options.description || page.description || page.excerpt || content || config.description;
  let keywords = (page.tags && page.tags.length ? page.tags : undefined) || (config as any).keywords || false;
  const title = options.title || page.title || config.title;
  const type = options.type || (this.is_post() ? 'article' : 'website');
  const url = prettyUrls(options.url || this.url, config.pretty_urls);
  const siteName = options.site_name || config.title;
  const twitterCard = options.twitter_card || 'summary';
  const date = options.date !== false ? options.date || page.date : false;
  const updated = options.updated !== false ? options.updated || page.updated : false;
  const language = options.language || page.lang || page.language || config.language;
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

  if (url) {
    result += og('og:url', encodeURL(url), false);
  } else {
    result += og('og:url');
  }

  result += og('og:site_name', siteName);
  if (description) {
    result += og('og:description', description, false);
  }

  if (language) {
    result += og('og:locale', localeToTerritory(language), false);
  }

  images = images.map(path => new URL(path, url || config.url).toString())
    .filter(url => !url.startsWith('data:'));

  images.forEach(path => {
    result += og('og:image', path, false);
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
    if (typeof keywords === 'string') keywords = [keywords];

    keywords.map(tag => {
      return tag.name ? tag.name : tag;
    }).filter(Boolean).sort().forEach(keyword => {
      result += og('article:tag', keyword);
    });
  }

  result += meta('twitter:card', twitterCard);

  if (options.twitter_image) {
    let twitter_image: string | URL = options.twitter_image;
    twitter_image = new URL(twitter_image, url || config.url);
    result += meta('twitter:image', twitter_image, false);
  } else if (images.length) {
    result += meta('twitter:image', images[0], false);
  }

  if (options.twitter_id) {
    let twitterId = options.twitter_id;
    if (!twitterId.startsWith('@')) twitterId = `@${twitterId}`;

    result += meta('twitter:creator', twitterId);
  }

  if (options.twitter_site) {
    result += meta('twitter:site', options.twitter_site, false);
  }

  if (options.fb_admins) {
    result += og('fb:admins', options.fb_admins);
  }

  if (options.fb_app_id) {
    result += og('fb:app_id', options.fb_app_id);
  }

  return result.trim();
}

export = openGraphHelper;
