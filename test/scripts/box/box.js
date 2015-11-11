'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var util = require('hexo-util');
var sinon = require('sinon');
var Pattern = util.Pattern;
var hash = require('../../../lib/hash');

function getHash(content) {
  return hash.hash(content);
}

describe('Box', function() {
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'box_tmp');
  var Box = require('../../../lib/box');

  function newBox(path) {
    var hexo = new Hexo(baseDir, {silent: true});
    var base = path ? pathFn.join(baseDir, path) : baseDir;
    return new Box(hexo, base);
  }

  before(function() {
    return fs.mkdir(baseDir);
  });

  after(function() {
    return fs.rmdir(baseDir);
  });

  it('constructor - add trailing "/" to the base path', function() {
    var box = newBox('foo');
    box.base.should.eql(pathFn.join(baseDir, 'foo') + pathFn.sep);
  });

  it('addProcessor() - no pattern', function() {
    var box = newBox();

    box.addProcessor(function() {
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('').should.eql({});
    p.process().should.eql('test');
  });

  it('addProcessor() - with regex', function() {
    var box = newBox();

    box.addProcessor(/^foo/, function() {
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - with pattern', function() {
    var box = newBox();

    box.addProcessor(new Pattern(/^foo/), function() {
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - no fn', function() {
    var box = newBox();
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', 'fn must be a function');
    });

    try {
      box.addProcessor('test');
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('_loadFiles() - create', function() {
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');

    return fs.writeFile(path, 'a').then(function() {
      return Promise.all([
        box._loadFiles(),
        fs.stat(path)
      ]);
    }).spread(function(files, stats) {
      var cacheId = 'test/a.txt';

      files.should.eql([
        {path: 'a.txt', type: 'create'}
      ]);

      box.Cache.toArray({lean: true}).should.eql([
        {
          _id: cacheId,
          hash: getHash('a'),
          modified: stats.mtime.getTime()
        }
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - update', function() {
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');
    var cacheId = 'test/a.txt';
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(path, 'a'),
      Cache.insert({
        _id: cacheId
      })
    ]).then(function() {
      return Promise.all([
        box._loadFiles(),
        fs.stat(path)
      ]);
    }).spread(function(files, stats) {
      files.should.eql([
        {path: 'a.txt', type: 'update'}
      ]);

      Cache.toArray({lean: true}).should.eql([
        {
          _id: cacheId,
          hash: getHash('a'),
          modified: stats.mtime.getTime()
        }
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - skip', function() {
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');
    var cacheId = 'test/a.txt';
    var hash = getHash('a');
    var Cache = box.Cache;
    var mtime = Date.now();

    return Promise.all([
      fs.writeFile(path, 'a'),
      Cache.insert({
        _id: cacheId,
        hash: hash,
        modified: mtime
      })
    ]).then(function() {
      return box._loadFiles();
    }).then(function(files) {
      files.should.eql([
        {type: 'skip', path: 'a.txt'}
      ]);

      Cache.toArray({lean: true}).should.eql([
        {
          _id: cacheId,
          hash: hash,
          modified: mtime
        }
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - delete', function() {
    var box = newBox('test');
    var cacheId = 'test/a.txt';
    var Cache = box.Cache;

    return Cache.insert({
      _id: cacheId
    }).then(function() {
      return box._loadFiles();
    }).then(function(files) {
      files.should.eql([
        {type: 'delete', path: 'a.txt'}
      ]);

      should.not.exist(Cache.findById(cacheId));
    });
  });

  it('_dispatch()', function() {
    var box = newBox();
    var path = 'a.txt';
    var data;

    box.addProcessor(function(file) {
      box.processingFiles[path].should.be.true;
      data = file;
    });

    return box._dispatch({
      path: path,
      type: 'create'
    }).then(function() {
      box.processingFiles[path].should.be.false;
      data.source.should.eql(pathFn.join(box.base, path));
      data.path.should.eql(path);
      data.type.should.eql('create');
      data.params.should.eql({});
    });
  });

  it('_dispatch() - params', function() {
    var box = newBox();
    var data = new Array(2);

    box.addProcessor(/(.*).js/, function(file) {
      data[0] = file;
    });

    box.addProcessor(function(file) {
      data[1] = file;
    });

    return box._dispatch({
      path: 'server.js',
      type: 'create'
    }).then(function() {
      data[0].params[1].should.eql('server');
      data[1].params.should.eql({});
    });
  });

  it('process()', function() {
    var box = newBox('test');
    var data = {};

    box.addProcessor(function(file) {
      data[file.path] = file;
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(function() {
      return box.process();
    }).then(function() {
      var keys = Object.keys(data);
      var key, item;

      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        item = data[key];

        item.path.should.eql(key);
        item.source.should.eql(pathFn.join(box.base, key));
        item.type.should.eql('create');
        item.params.should.eql({});
      }

      return fs.rmdir(box.base);
    });
  });

  it('process() - do nothing if target does not exist', function() {
    var box = newBox('test');

    return box.process();
  });

  it('watch() - create', function() {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);

    return box.watch().then(function() {
      var processor;
      box.isWatching().should.be.true;

      return new Promise(function(resolve, reject) {
        processor = sinon.spy(function(file) {
          file.source.should.eql(src);
          file.path.should.eql(path);
          file.type.should.eql('create');
          file.params.should.eql({});

          resolve();
        });

        box.addProcessor(processor);
        fs.writeFile(src, 'a').catch(reject);
      }).then(function() {
        processor.calledOnce.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - update', function() {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(function() {
      return box.watch();
    }).then(function() {
      var processor;

      return new Promise(function(resolve, reject) {
        processor = sinon.spy(function(file) {
          file.source.should.eql(src);
          file.path.should.eql(path);
          file.type.should.eql('update');
          file.params.should.eql({});

          resolve();
        });

        box.addProcessor(processor);
        fs.appendFile(src, 'b').catch(reject);
      }).then(function() {
        processor.calledOnce.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - delete', function() {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(function() {
      return box.watch();
    }).then(function() {
      var processor;

      return new Promise(function(resolve, reject) {
        processor = sinon.spy(function(file) {
          file.source.should.eql(src);
          file.path.should.eql(path);
          file.type.should.eql('delete');
          file.params.should.eql({});

          resolve();
        });

        box.addProcessor(processor);
        fs.unlink(src).catch(reject);
      }).then(function() {
        processor.calledOnce.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - rename file', function() {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var newPath = 'b.txt';
    var newSrc = pathFn.join(box.base, newPath);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(function() {
      return box.watch();
    }).then(function() {
      var processor;

      return new Promise(function(resolve, reject) {
        processor = sinon.spy(function(file) {
          switch (file.type){
            case 'create':
              file.source.should.eql(newSrc);
              file.path.should.eql(newPath);
              break;

            case 'delete':
              file.source.should.eql(src);
              file.path.should.eql(path);
              break;

            default:
              return reject(new Error('Type should be either create or delete'));
          }

          if (processor.calledTwice) {
            resolve();
          }
        });

        box.addProcessor(processor);
        fs.rename(src, newSrc).catch(reject);
      }).then(function() {
        processor.calledTwice.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - rename folder', function() {
    var box = newBox('test');
    var path = 'a/b.txt';
    var src = pathFn.join(box.base, path);
    var newPath = 'b/b.txt';
    var newSrc = pathFn.join(box.base, newPath);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(function() {
      return box.watch();
    }).then(function() {
      var processor;

      return new Promise(function(resolve, reject) {
        processor = sinon.spy(function(file) {
          switch (file.type){
            case 'create':
              file.source.should.eql(newSrc);
              file.path.should.eql(newPath);
              break;

            case 'delete':
              file.source.should.eql(src);
              file.path.should.eql(path);
              break;

            default:
              return reject(new Error('Type should be either create or delete'));
          }

          if (processor.calledTwice) {
            resolve();
          }
        });

        box.addProcessor(processor);
        fs.rename(pathFn.join(box.base, 'a'), pathFn.join(box.base, 'b')).catch(reject);
      }).then(function() {
        processor.calledTwice.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - watcher has started', function() {
    var box = newBox();

    return box.watch().then(function() {
      var errorCallback = sinon.spy(function(err) {
        err.should.have.property('message', 'Watcher has already started.');
      });

      return box.watch().catch(errorCallback).then(function() {
        errorCallback.calledOnce.should.be.true;
      });
    }).finally(function() {
      box.unwatch();
    });
  });

  it('watch() - run process() before start watching', function() {
    var box = newBox('test');
    var data = [];

    box.addProcessor(function(file) {
      data.push(file.path);
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(function() {
      return box.watch();
    }).then(function() {
      data.should.have.members(['a.txt', 'b/c.js']);
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('unwatch()', function() {
    var box = newBox('test');
    var processor = sinon.spy();

    box.watch().then(function() {
      box.addProcessor(processor);
      box.unwatch();

      return fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a');
    }).then(function() {
      processor.called.should.be.false;
    }).finally(function() {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('isWatching()', function() {
    var box = newBox();

    box.isWatching().should.be.false;

    return box.watch().then(function() {
      box.isWatching().should.be.true;
      return box.unwatch();
    }).then(function() {
      box.isWatching().should.be.false;
    }).finally(function() {
      box.unwatch();
    });
  });

  it('processBefore & processAfter events', function() {
    var box = newBox('test');
    var beforeSpy = sinon.spy();
    var afterSpy = sinon.spy();

    box.context.on('processBefore', beforeSpy);
    box.context.on('processAfter', afterSpy);

    return fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a').then(function() {
      return box.process();
    }).then(function() {
      beforeSpy.calledOnce.should.be.true;
      afterSpy.calledOnce.should.be.true;
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });
});
