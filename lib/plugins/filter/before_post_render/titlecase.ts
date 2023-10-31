let titlecase;

function titlecaseFilter(data): void {
  if (!(typeof data.titlecase !== 'undefined' ? data.titlecase : this.config.titlecase) || !data.title) return;

  if (!titlecase) titlecase = require('titlecase');
  data.title = titlecase(data.title);
}

export = titlecaseFilter;
