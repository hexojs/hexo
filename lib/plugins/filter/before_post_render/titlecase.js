'use strict';

let titlecase;

function titlecaseFilter(data) {
  if (!(typeof data.titlecase !== 'undefined' ? data.titlecase : this.config.titlecase) || !data.title) return;

  if (!titlecase) titlecase = require('titlecase');
  data.title = titlecase(data.title);
}

module.exports = titlecaseFilter;
