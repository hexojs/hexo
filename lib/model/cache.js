var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async'),
  util = require('../util'),
  file = util.file2;

exports.statics = {
  findBySource: function(source){
    return this.findOne({source: source.substring(hexo.base_dir.length)});
  }
};