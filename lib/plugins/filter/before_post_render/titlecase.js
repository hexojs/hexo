'use strict';

var titlecase = require('titlecase');

function titlecaseFilter(data){
  /* jshint validthis: true */
  if (!this.config.titlecase || !data.title) return;

  data.title = titlecase(data.title);
}

module.exports = titlecaseFilter;