import moize from 'moize';
import type { LocalsType } from '../../types';

interface Options {
  class?: string;
  text?: string | null;
  button?: string | boolean;
}

function searchFormHelper(this: LocalsType, options: Options = {}) {
  const { config } = this;
  const className = options.class || 'search-form';
  const { text = 'Search', button } = options;

  return `<form action="//google.com/search" method="get" accept-charset="UTF-8" class="${className}"><input type="search" name="q" class="${className}-input"${text ? ` placeholder="${text}"` : ''}>${button ? `<button type="submit" class="${className}-submit">${typeof button === 'string' ? button : text}</button>` : ''}<input type="hidden" name="sitesearch" value="${config.url}"></form>`;
}

export = moize.deep(searchFormHelper);
