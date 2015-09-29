'use strict';

var common = require('./common');
var Promise = require('bluebird');
var yfm = require('hexo-front-matter');
var pathFn = require('path');

exports.process = function(file) {
  if (this.render.isRenderable(file.path)) {
    return processPage.call(this, file);
  }

  return processAsset.call(this, file);
};

exports.pattern = common.ignoreTmpAndHiddenFile;

function processPage(file) {

  var Page = this.model('Page');
  var path = file.path;
  var doc = Page.findOne({source: path});
  var self = this;
  var config = this.config;
  var timezone = config.timezone;

  if (file.type === 'skip' && doc) {
    return;
  }

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return Promise.all([
    file.stat(),
    file.read()
  ]).spread(function(stats, content) {
    var data = yfm(content);
    var output = self.render.getOutput(path);

    data.source = path;
    data.raw = content;

    data.date = common.toDate(data.date);

    if (data.date) {
      if (timezone) data.date = common.timezone(data.date, timezone);
    } else {
      data.date = stats.ctime;
    }

    data.updated = common.toDate(data.updated);

    if (data.updated) {
      if (timezone) data.updated = common.timezone(data.updated, timezone);
    } else {
      data.updated = stats.mtime;
    }

    if (data.permalink) {
      data.path = data.permalink;
      delete data.permalink;

      if (data.path[data.path.length - 1] === '/') {
        data.path += 'index';
      }

      if (!pathFn.extname(data.path)) {
        data.path += '.' + output;
      }
    } else {
      var extname = pathFn.extname(path);
      data.path = path.substring(0, path.length - extname.length) + '.' + output;
    }

    if (!data.layout && output !== 'html' && output !== 'htm') {
      data.layout = false;
    }

    if (doc) {
      return doc.replace(data);
    }

    return Page.insert(data);
  });
}

function processAsset(file) {

  var id = file.source.substring(this.base_dir.length).replace(/\\/g, '/');
  var Asset = this.model('Asset');
  var doc = Asset.findById(id);

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  if (doc) {
    doc.path = file.path;
    doc.modified = file.type !== 'skip';

    return doc.save();
  }

  return Asset.insert({
    _id: id,
    path: file.path
  });
}
