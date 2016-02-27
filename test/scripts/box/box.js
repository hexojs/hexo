'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var util = require('hexo-util');
var sinon = require('sinon');
var Pattern = util.Pattern;

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
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - do nothing if target does not exist', function() {
    var box = newBox('test');

    return box.process();
  });

  it('process() - create', function() {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(function() {
      return box.process();
    }).then(function() {
      var file = processor.args[0][0];
      file.type.should.eql('create');
      file.path.should.eql(name);
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - mtime changed', function() {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);
    var cacheId = 'test/' + name;

    var processor = sinon.spy();
    box.addProcessor(processor);

    return Promise.all([
      fs.writeFile(path, 'a'),
      box.Cache.insert({
        _id: cacheId,
        modified: 0
      })
    ]).then(function() {
      return box.process();
    }).then(function() {
      var file = processor.args[0][0];
      file.type.should.eql('update');
      file.path.should.eql(name);
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - hash changed', function() {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);
    var cacheId = 'test/' + name;

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(function() {
      return fs.stat(path);
    }).then(function(stats) {
      return box.Cache.insert({
        _id: cacheId,
        modified: stats.mtime
      });
    }).then(function() {
      return box.process();
    }).then(function() {
      var file = processor.args[0][0];
      file.type.should.eql('update');
      file.path.should.eql(name);
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - skip', function() {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);
    var cacheId = 'test/' + name;

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(function() {
      return fs.stat(path);
    }).then(function(stats) {
      return box.Cache.insert({
        _id: cacheId,
        modified: stats.mtime,
        hash: util.hash('a').toString('hex')
      });
    }).then(function() {
      return box.process();
    }).then(function() {
      var file = processor.args[0][0];
      file.type.should.eql('skip');
      file.path.should.eql(name);
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - delete', function() {
    var box = newBox('test');
    var cacheId = 'test/a.txt';

    var processor = sinon.spy(function(file) {
      file.type.should.eql('delete');
    });

    box.addProcessor(processor);

    return Promise.all([
      fs.mkdirs(box.base),
      box.Cache.insert({
        _id: cacheId
      })
    ]).then(function() {
      return box.process();
    }).then(function() {
      processor.calledOnce.should.be.true;
    }).finally(function() {
      return fs.rmdir(box.base);
    });
  });

  it('process() - params', function() {
    var box = newBox('test');
    var path = pathFn.join(box.base, 'posts', '123456');

    var processor = sinon.spy(function(file) {
      file.params.id.should.eql('123456');
    });

    box.addProcessor('posts/:id', processor);

    return fs.writeFile(path, 'a').then(function() {
      return box.process();
    }).then(function() {
      processor.calledOnce.should.be.true;
    }).finally(function() {
      return fs.rmdir(box.base);
    });
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
          try {
            file.source.should.eql(src);
            file.path.should.eql(path);
            file.type.should.eql('create');
            file.params.should.eql({});

            resolve();
          } catch (err) {
            reject(err);
          }
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
          try {
            file.source.should.eql(src);
            file.path.should.eql(path);
            file.type.should.eql('update');
            file.params.should.eql({});

            resolve();
          } catch (err) {
            reject(err);
          }
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
          try {
            file.source.should.eql(src);
            file.path.should.eql(path);
            file.type.should.eql('delete');
            file.params.should.eql({});

            resolve();
          } catch (err) {
            reject(err);
          }
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
          try {
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
          } catch (err) {
            reject(err);
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
          try {
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
          } catch (err) {
            reject(err);
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

    var beforeSpy = sinon.spy(function(file) {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    var afterSpy = sinon.spy(function(file) {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    box.on('processBefore', beforeSpy);
    box.on('processAfter', afterSpy);

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
