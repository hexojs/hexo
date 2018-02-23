'use strict';

function searchFormHelper(options = {}) {
  const config = this.config;
  const className = options.class || 'search-form';
  const text = options.hasOwnProperty('text') ? options.text : 'Search';
  const button = options.button;

  return `<form action="//google.com/search" method="get" accept-charset="UTF-8" class="${className}"><input type="search" name="q" class="${className}-input"${text ? ` placeholder="${text}"` : ''}>${button ? `<button type="submit" class="${className}-submit">${typeof button === 'string' ? button : text}</button>` : ''}<input type="hidden" name="sitesearch" value="${config.url}"></form>`;
}

module.exports = searchFormHelper;
