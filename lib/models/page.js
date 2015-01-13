var Schema = require('warehouse').Schema;
var pathFn = require('path');
var Moment = require('./types/moment');
var moment = require('moment');
var common = require('./common');

module.exports = function(ctx){
  var swig = ctx.extend.tag.swig;

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
    raw: {type: String, default: ''}
  });

  Page.virtual('permalink').get(function(){
    return ctx.config.url + '/' + this.path;
  });

  Page.virtual('full_source').get(function(){
    return pathFn.join(ctx.source_dir, this.source || '');
  });

  Page.virtual('content').get(function(){
    return common.renderContent(swig, this);
  });

  Page.virtual('excerpt').get(function(){
    return common.getExcerpt(this.content);
  });

  Page.virtual('more').get(function(){
    return common.getMore(this.content);
  });

  return Page;
};