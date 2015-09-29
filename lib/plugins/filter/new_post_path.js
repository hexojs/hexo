'use strict';

var pathFn = require('path');
var moment = require('moment');
var _ = require('lodash');
var Promise = require('bluebird');
var util = require('hexo-util');
var fs = require('hexo-fs');
var Permalink = util.Permalink;
var permalink;

var reservedKeys = {
  year: true,
  month: true,
  i_month: true,
  day: true,
  i_day: true,
  title: true
};

function newPostPathFilter(data, replace) {
  data = data || {};

  var sourceDir = this.source_dir;
  var draftDir = pathFn.join(sourceDir, '_drafts');
  var postDir = pathFn.join(sourceDir, '_posts');
  var config = this.config;
  var newPostName = config.new_post_name;
  var permalinkDefaults = config.permalink_defaults;
  var path = data.path;
  var layout = data.layout;
  var slug = data.slug;
  var target = '';

  if (!permalink || permalink.rule !== newPostName) {
    permalink = new Permalink(newPostName);
  }

  if (path) {
    switch (layout){
      case 'page':
        target = pathFn.join(sourceDir, path);
        break;

      case 'draft':
        target = pathFn.join(draftDir, path);
        break;

      default:
        target = pathFn.join(postDir, path);
    }
  } else if (slug) {
    switch (layout){
      case 'page':
        target = pathFn.join(sourceDir, slug, 'index');
        break;

      case 'draft':
        target = pathFn.join(draftDir, slug);
        break;

      default:
        var date = moment(data.date || Date.now());
        var keys = Object.keys(data);
        var key = '';

        var filenameData = {
          year: date.format('YYYY'),
          month: date.format('MM'),
          i_month: date.format('M'),
          day: date.format('DD'),
          i_day: date.format('D'),
          title: slug
        };

        for (var i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          if (!reservedKeys[key]) filenameData[key] = data[key];
        }

        target = pathFn.join(postDir, permalink.stringify(
          _.defaults(filenameData, permalinkDefaults)));
    }
  } else {
    return Promise.reject(new TypeError('Either data.path or data.slug is required!'));
  }

  if (!pathFn.extname(target)) {
    target += pathFn.extname(newPostName) || '.md';
  }

  if (replace) {
    return Promise.resolve(target);
  }

  return fs.ensurePath(target);
}

module.exports = newPostPathFilter;
