var Schema = require('warehouse').Schema;
var pathFn = require('path');
var Moment = require('./types/moment');
var moment = require('moment');

module.exports = function(ctx){
  var Page = new Schema({
    title: {type: String, default: ''},
    date: {type: Moment, default: moment},
    updated: {type: Moment, default: moment},
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'page'},
    content: {type: String, default: ''},
    excerpt: {type: String, default: ''},
    more: {type: String, default: ''},
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

  return Page;
};