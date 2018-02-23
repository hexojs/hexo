'use strict';

const pathFn = require('path');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const util = require('hexo-util');
const fs = require('hexo-fs');
const Permalink = util.Permalink;
let permalink;

const reservedKeys = {
  year: true,
  month: true,
  i_month: true,
  day: true,
  i_day: true,
  title: true
};

function newPostPathFilter(data = {}, replace) {
  const sourceDir = this.source_dir;
  const draftDir = pathFn.join(sourceDir, '_drafts');
  const postDir = pathFn.join(sourceDir, '_posts');
  const config = this.config;
  const newPostName = config.new_post_name;
  const permalinkDefaults = config.permalink_defaults;
  const path = data.path;
  const layout = data.layout;
  const slug = data.slug;
  let target = '';

  if (!permalink || permalink.rule !== newPostName) {
    permalink = new Permalink(newPostName);
  }

  if (path) {
    switch (layout) {
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
    switch (layout) {
      case 'page':
        target = pathFn.join(sourceDir, slug, 'index');
        break;

      case 'draft':
        target = pathFn.join(draftDir, slug);
        break;

      default: {
        const date = moment(data.date || Date.now());
        const keys = Object.keys(data);
        let key = '';

        const filenameData = {
          year: date.format('YYYY'),
          month: date.format('MM'),
          i_month: date.format('M'),
          day: date.format('DD'),
          i_day: date.format('D'),
          title: slug
        };

        for (let i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          if (!reservedKeys[key]) filenameData[key] = data[key];
        }

        target = pathFn.join(postDir, permalink.stringify(
          _.defaults(filenameData, permalinkDefaults)));
      }
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
