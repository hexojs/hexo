'use strict';

var Schema = require('warehouse').Schema;
var pathFn = require('path');
var Moment = require('./types/moment');
var moment = require('moment');
var CacheString = require('./types/cachestring');

module.exports = function(ctx){
  var Page = new Schema({
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
    content: {type: CacheString, default: ''},
    excerpt: {type: CacheString, default: ''},
    more: {type: CacheString, default: ''}
  });

  Page.virtual('permalink').get(function(){
    return ctx.config.url + '/' + this.path;
  });

  Page.virtual('full_source').get(function(){
    return pathFn.join(ctx.source_dir, this.source || '');
  });

  return Page;
};