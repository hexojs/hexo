var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');

var dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('asset', function(){
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'asset_test');
  var hexo = new Hexo(baseDir);
  var asset = require('../../../lib/plugins/processor/asset');
  var process = asset.process.bind(hexo);
  var source = hexo.source;
  var File = source.File;
  var Asset = hexo.model('Asset');
  var Page = hexo.model('Page');

  function newFile(options){
    options.source = pathFn.join(source.base, options.path);
    return new File(options);
  }

  before(function(){
    return fs.mkdirs(baseDir).then(function(){
      return hexo.init();
    });
  });

  after(function(){
    return fs.rmdir(baseDir);
  });

  it('asset - type: create', function(){
    var file = newFile({
      path: 'foo.jpg',
      type: 'create'
    });

    return process(file).then(function(){
      var id = 'source/' + file.path;
      var asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.path);
      asset.modified.should.be.true;

      return asset.remove();
    });
  });

  it('asset - type: update', function(){
    var file = newFile({
      path: 'foo.jpg',
      type: 'update'
    });

    var id = 'source/' + file.path;

    return Asset.insert({
      _id: id,
      path: file.path,
      modified: false
    }).then(function(){
      return process(file);
    }).then(function(){
      var asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.path);
      asset.modified.should.be.true;

      return asset.remove();
    });
  });

  it('asset - type: skip', function(){
    var file = newFile({
      path: 'foo.jpg',
      type: 'skip'
    });

    var id = 'source/' + file.path;

    return Asset.insert({
      _id: id,
      path: file.path,
      modified: false
    }).then(function(){
      return process(file);
    }).then(function(){
      var asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.path);
      asset.modified.should.be.false;

      return asset.remove();
    });
  });

  it('asset - type: delete', function(){
    var file = newFile({
      path: 'foo.jpg',
      type: 'delete'
    });

    var id = 'source/' + file.path;

    return Asset.insert({
      _id: id,
      path: file.path
    }).then(function(){
      return process(file);
    }).then(function(){
      should.not.exist(Asset.findById(id));
    });
  });

  it('page - type: create', function(){
    var body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    var file = newFile({
      path: 'hello.swig',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.title.should.eql('Hello world');
      page.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
      page.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
      page._content.should.eql('The quick brown fox jumps over the lazy dog');
      page.source.should.eql(file.path);
      page.raw.should.eql(body);
      page.path.should.eql('hello.html');
      page.layout.should.eql('page');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - type: update', function(){
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'hello.swig',
      type: 'update',
      content: new Buffer(body)
    });

    var id;

    return Promise.all([
      Page.insert({source: file.path, path: 'hello.html'}),
      fs.writeFile(file.source, body)
    ]).spread(function(doc){
      id = doc._id;
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page._id.should.eql(id);
      page.title.should.eql('Hello world');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - type: delete', function(){
    var file = newFile({
      path: 'hello.swig',
      type: 'delete'
    });

    return Page.insert({
      source: file.path,
      path: 'hello.html'
    }).then(function(){
      return process(file);
    }).then(function(){
      should.not.exist(Page.findOne({source: file.path}));
    });
  });

  it('page - use the status of the source file if date not set', function(){
    var file = newFile({
      path: 'hello.swig',
      type: 'create'
    });

    return fs.writeFile(file.source, '').then(function(){
      return Promise.all([
        fs.stat(file.source),
        process(file)
      ]);
    }).spread(function(stats){
      var page = Page.findOne({source: file.path});

      page.date.toDate().should.eql(stats.ctime);
      page.updated.toDate().should.eql(stats.mtime);

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink', function(){
    var body = [
      'title: "Hello world"',
      'permalink: foo.html',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'hello.swig',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.path.should.eql('foo.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink (without extension name)', function(){
    var body = [
      'title: "Hello world"',
      'permalink: foo',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'hello.swig',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.path.should.eql('foo.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink (with trailing slash)', function(){
    var body = [
      'title: "Hello world"',
      'permalink: foo/',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'hello.swig',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.path.should.eql('foo/index.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - set layout to false if output is not html', function(){
    var body = 'foo: 1';

    var file = newFile({
      path: 'test.yml',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.content.should.eql('{"foo":1}');
      page.layout.should.eql('false');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - don\'t set layout to false if layout is set but output is not html', function(){
    var body = [
      'layout: something',
      '---',
      'foo: 1'
    ].join('\n');

    var file = newFile({
      path: 'test.yml',
      type: 'create',
      content: new Buffer(body)
    });

    return fs.writeFile(file.source, body).then(function(){
      return process(file);
    }).then(function(){
      var page = Page.findOne({source: file.path});

      page.content.should.eql('{"foo":1}');
      page.layout.should.eql('something');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });
});