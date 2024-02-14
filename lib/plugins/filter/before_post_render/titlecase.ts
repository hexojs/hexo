import type { RenderData } from '../../../types';

let titlecase;

function titlecaseFilter(data: RenderData): void {
  if (!(typeof data.titlecase !== 'undefined' ? data.titlecase : this.config.titlecase) || !data.title) return;

  if (!titlecase) titlecase = require('titlecase');
  data.title = titlecase(data.title);
}

export = titlecaseFilter;
