'use strict';

const { Schema } = require('warehouse');
const { join } = require('path');
const Moment = require('./types/moment');
const moment = require('moment');
const full_url_for = require('../plugins/helper/full_url_for');

module.exports = ctx => {
  const Page = new Schema({
    title: {type: String, default: ''},
    date: {
      type: Moment,
      default: moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    updated: {
      type: Moment,
      default: moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'page'},
    _content: {type: String, default: ''},
    source: {type: String, required: true},
    path: {type: String, required: true},
    raw: {type: String, default: ''},
    content: {type: String},
    excerpt: {type: String},
    more: {type: String}
  });

  Page.virtual('permalink').get(function() {
    const { config } = ctx;
    let url = full_url_for.call(ctx, this.path);
    if (config.pretty_urls.trailing_index === false) url = url.replace(/index\.html$/, '');
    return url;
  });

  Page.virtual('full_source').get(function() {
    return join(ctx.source_dir, this.source || '');
  });

  return Page;
};
