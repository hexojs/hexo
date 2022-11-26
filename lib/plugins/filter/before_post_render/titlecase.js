'use strict';

let titlecase;

function titlecaseFilter(data) {
  if (!this.config.titlecase || !data.title) return;

  if (!titlecase) titlecase = require('titlecase');
  data.title = titlecase(data.title);
}

module.exports = titlecaseFilter;
