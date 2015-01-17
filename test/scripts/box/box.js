var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var crypto = require('crypto');
var util = require('hexo-util');
var Pattern = util.Pattern;
var testUtil = require('../../util');

function checksum(content){
  var hash = crypto.createHash('sha1');
  hash.update(content);
  return hash.digest('hex');
}

describe('Box', function(){
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'box_tmp');
  var Box = require('../../../lib/box');

  function newBox(path){
    var hexo = new Hexo(baseDir, {silent: true});
    var base = path ? pathFn.join(baseDir, path) : baseDir;
    return new Box(hexo, base);
  }

  before(function(){
    return fs.mkdir(baseDir);
  });

  after(function(){
    return fs.rmdir(baseDir);
  });

  it('constructor - add trailing "/" to the base path', function(){
    var box = newBox('foo');
    box.base.should.eql(pathFn.join(baseDir, 'foo') + pathFn.sep);
  });

  it('addProcessor() - no pattern', function(){
    var box = newBox();

    box.addProcessor(function(){
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('').should.eql({});
    p.process().should.eql('test');
  });

  it('addProcessor() - with regex', function(){
    var box = newBox();

    box.addProcessor(/^foo/, function(){
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - with pattern', function(){
    var box = newBox();

    box.addProcessor(new Pattern(/^foo/), function(){
      return 'test';
    });

    var p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - no fn', function(){
    var box = newBox();

    try {
      box.addProcessor('test');
    } catch (err){
      err.should.have.property('message', 'fn must be a function');
    }
  });

  it('_loadFiles() - create', function(){
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');

    return fs.writeFile(path, 'a').then(function(){
      return box._loadFiles();
    }).then(function(files){
      var cacheId = 'test/a.txt';

      files.should.eql([
        {path: 'a.txt', type: 'create'}
      ]);

      box.Cache.toArray({lean: true}).should.eql([
        {_id: cacheId, checksum: checksum('a')}
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - update', function(){
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');
    var cacheId = 'test/a.txt';
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(path, 'a'),
      Cache.insert({_id: cacheId, checksum: 'a'})
    ]).then(function(){
      return box._loadFiles();
    }).then(function(files){
      files.should.eql([
        {path: 'a.txt', type: 'update'}
      ]);

      Cache.toArray({lean: true}).should.eql([
        {_id: cacheId, checksum: checksum('a')}
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - skip', function(){
    var box = newBox('test');
    var path = pathFn.join(box.base, 'a.txt');
    var cacheId = 'test/a.txt';
    var hash = checksum('a');
    var Cache = box.Cache;

    return Promise.all([
      fs.writeFile(path, 'a'),
      Cache.insert({_id: cacheId, checksum: hash})
    ]).then(function(){
      return box._loadFiles();
    }).then(function(files){
      files.should.eql([
        {type: 'skip', path: 'a.txt'}
      ]);

      Cache.toArray({lean: true}).should.eql([
        {_id: cacheId, checksum: hash}
      ]);

      return fs.rmdir(box.base);
    });
  });

  it('_loadFiles() - delete', function(){
    var box = newBox('test');
    var cacheId = 'test/a.txt';
    var Cache = box.Cache;

    return Cache.insert({
      _id: cacheId,
      checksum: 'a'
    }).then(function(){
      return box._loadFiles();
    }).then(function(files){
      files.should.eql([
        {type: 'delete', path: 'a.txt'}
      ]);

      should.not.exist(Cache.findById(cacheId));
    });
  });

  it('_dispatch()', function(){
    var box = newBox();
    var path = 'a.txt';
    var data;

    box.addProcessor(function(file){
      box.processingFiles[path].should.be.true;
      data = file;
    });

    return box._dispatch({
      path: path,
      type: 'create'
    }).then(function(){
      box.processingFiles[path].should.be.false;
      data.source.should.eql(pathFn.join(box.base, path));
      data.path.should.eql(path);
      data.type.should.eql('create');
      data.params.should.eql({});
    });
  });

  it('_dispatch() - params', function(){
    var box = newBox();
    var data = new Array(2);

    box.addProcessor(/(.*).js/, function(file){
      data[0] = file;
    });

    box.addProcessor(function(file){
      data[1] = file;
    });

    return box._dispatch({
      path: 'server.js',
      type: 'create'
    }).then(function(){
      data[0].params[1].should.eql('server');
      data[1].params.should.eql({});
    });
  });

  it('process()', function(){
    var box = newBox('test');
    var data = {};

    box.addProcessor(function(file){
      data[file.path] = file;
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(function(){
      return box.process();
    }).then(function(){
      var keys = Object.keys(data);
      var key, item;

      for (var i = 0, len = keys.length; i < len; i++){
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

  it('process() - do nothing if target does not exist', function(){
    var box = newBox('test');

    return box.process();
  });

  it('watch() - create', function(callback){
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);

    box.watch().then(function(){
      box.isWatching().should.be.true;

      box.addProcessor(function(file){
        file.source.should.eql(src);
        file.path.should.eql(path);
        file.type.should.eql('create');
        file.params.should.eql({});
        file.content.toString().should.eql('a');

        box.unwatch();
        fs.rmdir(box.base, callback);
      });

      fs.writeFile(src, 'a');
    });
  });

  it('watch() - update', function(callback){
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId, checksum: 'a'})
    ]).then(function(){
      return box.watch();
    }).then(function(){
      return testUtil.wait(300);
    }).then(function(){
      box.addProcessor(function(file){
        file.source.should.eql(src);
        file.path.should.eql(path);
        file.type.should.eql('update');
        file.params.should.eql({});
        file.content.should.eql(new Buffer('ab'));

        box.unwatch();
        fs.rmdir(box.base, callback);
      });

      fs.appendFile(src, 'b');
    });
  });

  it('watch() - delete', function(callback){
    var box = newBox('test');
    var path = 'a.txt';
    var src = pathFn.join(box.base, path);
    var cacheId = 'test/' + path;
    var Cache = box.Cache;

    Promise.all([
      fs.writeFile(src, 'a'),
      Cache.insert({_id: cacheId, checksum: 'a'})
    ]).then(function(){
      return box.watch();
    }).then(function(){
      return testUtil.wait(300);
    }).then(function(){

      box.addProcessor(function(file){
        file.source.should.eql(src);
        file.path.should.eql(path);
        file.type.should.eql('delete');
        file.params.should.eql({});
        should.not.exist(file.content);

        box.unwatch();
        fs.rmdir(box.base, callback);
      });

      fs.unlink(src);
    });
  });

  it('watch() - watcher has started', function(callback){
    var box = newBox();

    box.watch().then(function(){
      box.watch().catch(function(err){
        err.should.have.property('message', 'Watcher has already started.');
        box.unwatch();
        callback();
      });
    });
  });

  it('watch() - run process() before start watching', function(){
    var box = newBox('test');
    var data = [];

    box.addProcessor(function(file){
      data.push(file.path);
    });

    return Promise.all([
      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(box.base, 'b', 'c.js'), 'c')
    ]).then(function(){
      return box.watch();
    }).then(function(){
      data.should.have.members(['a.txt', 'b/c.js']);
      box.unwatch();

      return fs.rmdir(box.base);
    });
  });

  it('unwatch()', function(callback){
    var box = newBox('test');

    box.watch().then(function(){
      var emitted = false;

      box.addProcessor(function(file){
        emitted = true;
      });

      box.unwatch();

      fs.writeFile(pathFn.join(box.base, 'a.txt'), 'a').then(function(){
        emitted.should.be.false;
        fs.rmdir(box.base, callback);
      });
    });
  });

  it('unwatch() - watcher not started', function(){
    var box = newBox();

    try {
      box.unwatch();
    } catch (err){
      err.should.have.property('message', 'Watcher hasn\'t started yet.');
    }
  });

  it('isWatching()', function(){
    var box = newBox();

    return box.watch().then(function(){
      box.isWatching().should.be.true;
      return box.unwatch();
    }).then(function(){
      box.isWatching().should.be.false;
    });
  });

  it('processBefore & processAfter events');
});