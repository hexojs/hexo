var common = require('./common');
var Promise = require('bluebird');
var yfm = require('hexo-front-matter');
var pathFn = require('path');

exports.process = function(file){
  if (this.render.isRenderable(file.path)){
    return processPage.call(this, file);
  } else {
    return processAsset.call(this, file);
  }
};

exports.pattern = common.ignoreTmpAndHiddenFile;

function processPage(file){
  var Page = this.model('Page');
  var path = file.path;
  var doc = Page.findOne({source: path});
  var self = this;

  if (file.type === 'skip' && doc){
    return;
  }

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  return Promise.all([
    file.stat(),
    file.read()
  ]).spread(function(stats, content){
    var data = yfm(content);
    data.content = data._content;
    data.source = path;
    data.raw = content;

    if (!data.date) data.date = stats.ctime;
    if (!data.updated) data.updated = stats.mtime;

    if (data.permalink){
      data.path = data.permalink;
      delete data.permalink;

      if (data.path[data.path.length - 1] === '/'){
        data.path += 'index';
      }
    } else {
      var extname = pathFn.extname(path);
      data.path = path.substring(0, path.length - extname.length);
    }

    if (!pathFn.extname(data.path)){
      var output = self.render.getOutput(path);
      data.path += '.' + output;
    }

    return self.post.render(file.source, data);
  }).then(function(data){
    data._content = data.content;
    delete data.content;

    if (doc){
      return doc.replace(data);
    } else {
      return Page.insert(data);
    }
  });
}

function processAsset(file){
  var id = file.source.substring(this.base_dir.length);
  var Asset = this.model('Asset');
  var doc = Asset.findById(id);

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  if (doc){
    doc.path = file.path;
    doc.modified = file.type === 'update';

    return doc.save();
  } else {
    return Asset.insert({
      _id: id,
      path: file.path
    });
  }
}