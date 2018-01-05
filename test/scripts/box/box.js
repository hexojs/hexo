var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var util = require('hexo-util');
var sinon = require('sinon');
var Pattern = util.Pattern;

describe('Box', () => {
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'box_tmp');
  var Box = require('../../../lib/box');

  function newBox(path, config) {
    var hexo = new Hexo(baseDir, {silent: true});
    hexo.config = Object.assign(hexo.config, config);
    var base = path ? pathFn.join(baseDir, path) : baseDir;
    return new Box(hexo, base);
  }

  before(() => fs.mkdir(baseDir));

  after(() => fs.rmdir(baseDir));

  it('constructor - add trailing "/" to the base path', () => {
    var box = newBox('foo');
    box.base.should.eql(pathFn.join(baseDir, 'foo') + pathFn.sep);
  });

  it('constructor - make ignore an array if its not one', () => {
    var box = newBox('foo', {ignore: 'fooDir'});
    box.ignore.should.eql(['fooDir']);
  });

  it('addProcessor() - no pattern', () => {
    var box = newBox();

    box.addProcessor(() => 'test');

    var p = box.processors[0];

    p.pattern.match('').should.eql({});
    p.process().should.eql('test');
  });

  it('addProcessor() - with regex', () => {
    var box = newBox();

    box.addProcessor(/^foo/, () => 'test');

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - with pattern', () => {
    var box = newBox();

    box.addProcessor(new Pattern(/^foo/), () => 'test');

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - no fn', () => {
    var box = newBox();
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'fn must be a function');
    });

    try {
      box.addProcessor('test');
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
  });

  it('process()', () => {
    var box = newBox('test');
    var data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(() => box.process()).then(() => {
      var keys = Object.keys(data);
      var key,
        item;

      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        item = data[key];

        item.path.should.eql(key);
        item.source.should.eql(pathFn.join(box.base, key));
        item.type.should.eql('create');
        item.params.should.eql({});
      }
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - do nothing if target does not exist', () => {
    var box = newBox('test');

    return box.process();
  });

  it('process() - create', () => {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(() => box.process()).then(() => {
      var file = processor.args[0][0];
      file.type.should.eql('create');
      file.path.should.eql(name);
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - mtime changed', () => {
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
    ]).then(() => box.process()).then(() => {
      var file = processor.args[0][0];
      file.type.should.eql('update');
      file.path.should.eql(name);
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - hash changed', () => {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);
    var cacheId = 'test/' + name;

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(() => fs.stat(path)).then(stats => box.Cache.insert({
      _id: cacheId,
      modified: stats.mtime
    })).then(() => box.process()).then(() => {
      var file = processor.args[0][0];
      file.type.should.eql('update');
      file.path.should.eql(name);
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - skip', () => {
    var box = newBox('test');
    var name = 'a.txt';
    var path = pathFn.join(box.base, name);
    var cacheId = 'test/' + name;

    var processor = sinon.spy();
    box.addProcessor(processor);

    return fs.writeFile(path, 'a').then(() => fs.stat(path)).then(stats => box.Cache.insert({
      _id: cacheId,
      modified: stats.mtime,
      hash: util.hash('a').toString('hex')
    })).then(() => box.process()).then(() => {
      var file = processor.args[0][0];
      file.type.should.eql('skip');
      file.path.should.eql(name);
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - delete', () => {
    var box = newBox('test');
    var cacheId = 'test/a.txt';

    var processor = sinon.spy(file => {
      file.type.should.eql('delete');
    });

    box.addProcessor(processor);

    return Promise.all([
      fs.mkdirs(box.base),
      box.Cache.insert({
        _id: cacheId
      })
    ]).then(() => box.process()).then(() => {
      processor.calledOnce.should.be.true;
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - params', () => {
    var box = newBox('test');
    var path = pathFn.join(box.base, 'posts', '123456');

    var processor = sinon.spy(file => {
      file.params.id.should.eql('123456');
    });

    box.addProcessor('posts/:id', processor);

    return fs.writeFile(path, 'a').then(() => box.process()).then(() => {
      processor.calledOnce.should.be.true;
    }).finally(() => fs.rmdir(box.base));
  });

  it('process() - skip files if they match glob epression in ignore', () => {
    var box = newBox('test', {ignore: '**/ignore_me'});
    var data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'foo.txt'), 'foo'),
      fs.writeFile(pathFn.join(box.base, 'ignore_me', 'bar.txt'), 'ignore_me')
    ]).then(() => box.process()).then(() => {
      var keys = Object.keys(data);

      keys.length.should.eql(1);
      keys[0].should.eql('foo.txt');
    }).finally(() => fs.rmdir(box.base));
  });

  it('watch() - create', () => {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var processor = sinon.spy();

    box.addProcessor(processor);

    return box.watch().then(() => {
      box.isWatching().should.be.true;
      return fs.writeFile(src, 'a');
    }).delay(500).then(() => {
      var file = processor.args[0][0];

      file.source.should.eql(src);
      file.path.should.eql(path);
      file.type.should.eql('create');
      file.params.should.eql({});
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - update', () => {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;
    var processor = sinon.spy();

    box.addProcessor(processor);

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(() => box.watch()).then(() => fs.appendFile(src, 'b')).delay(500).then(() => {
      var file = processor.lastCall.args[0];

      file.source.should.eql(src);
      file.path.should.eql(path);
      file.type.should.eql('update');
      file.params.should.eql({});
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - delete', () => {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;
    var processor = sinon.spy();

    box.addProcessor(processor);

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(() => box.watch()).then(() => fs.unlink(src)).delay(500).then(() => {
      var file = processor.lastCall.args[0];

      file.source.should.eql(src);
      file.path.should.eql(path);
      file.type.should.eql('delete');
      file.params.should.eql({});
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - rename file', () => {
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var newPath = 'b.txt';
    var newSrc = pathFn.join(box.base, newPath);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;
    var processor = sinon.spy();

    box.addProcessor(processor);

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(() => box.watch()).then(() => fs.rename(src, newSrc)).delay(500).then(() => {
      var lastTwoCalls = processor.args.slice(processor.args.length - 2, processor.args.length);

      lastTwoCalls.forEach(args => {
        var file = args[0];

        switch (file.type) {
          case 'create':
            file.source.should.eql(newSrc);
            file.path.should.eql(newPath);
            break;

          case 'delete':
            file.source.should.eql(src);
            file.path.should.eql(path);
            break;
        }
      });
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - rename folder', () => {
    var box = newBox('test');
    var path = 'a/b.txt';
    var src = pathFn.join(box.base, path);
    var newPath = 'b/b.txt';
    var newSrc = pathFn.join(box.base, newPath);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;
    var processor = sinon.spy();

    box.addProcessor(processor);

    return Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]).then(() => box.watch()).then(() => fs.rename(pathFn.join(box.base, 'a'), pathFn.join(box.base, 'b'))).delay(500).then(() => {
      var lastTwoCalls = processor.args.slice(processor.args.length - 2, processor.args.length);

      lastTwoCalls.forEach(args => {
        var file = args[0];

        switch (file.type) {
          case 'create':
            file.source.should.eql(newSrc);
            file.path.should.eql(newPath);
            break;

          case 'delete':
            file.source.should.eql(src);
            file.path.should.eql(path);
            break;
        }
      });
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('watch() - watcher has started', () => {
    var box = newBox();

    return box.watch().then(() => {
      var errorCallback = sinon.spy(err => {
        err.should.have.property('message', 'Watcher has already started.');
      });

      return box.watch().catch(errorCallback).then(() => {
        errorCallback.calledOnce.should.be.true;
      });
    }).finally(() => {
      box.unwatch();
    });
  });

  it('watch() - run process() before start watching', () => {
    var box = newBox('test');
    var data = [];

    box.addProcessor(file => {
      data.push(file.path);
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(() => box.watch()).then(() => {
      data.should.have.members(['a.txt', 'b/c.js']);
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('unwatch()', () => {
    var box = newBox('test');
    var processor = sinon.spy();

    return box.watch().then(() => {
      box.addProcessor(processor);
      box.unwatch();

      return fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a');
    }).then(() => {
      processor.called.should.be.false;
    }).finally(() => {
      box.unwatch();
      return fs.rmdir(box.base);
    });
  });

  it('isWatching()', () => {
    var box = newBox();

    box.isWatching().should.be.false;

    return box.watch().then(() => {
      box.isWatching().should.be.true;
      return box.unwatch();
    }).then(() => {
      box.isWatching().should.be.false;
    }).finally(() => {
      box.unwatch();
    });
  });

  it('processBefore & processAfter events', () => {
    var box = newBox('test');

    var beforeSpy = sinon.spy(file => {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    var afterSpy = sinon.spy(file => {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    box.on('processBefore', beforeSpy);
    box.on('processAfter', afterSpy);

    return fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a').then(() => box.process()).then(() => {
      beforeSpy.calledOnce.should.be.true;
      afterSpy.calledOnce.should.be.true;
    }).finally(() => fs.rmdir(box.base));
  });
});
