var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('../../../lib/util').fs;

function createDummyFolder(path){
  // TODO nested dummy files
  return Promise.all([
    fs.writeFile(pathFn.join(path, 'a.txt'), 'a'),
    fs.writeFile(pathFn.join(path, 'b.js'), 'b'),
    fs.writeFile(pathFn.join(path, '.c'), 'c')
  ]);}

describe('fs', function(){
  var tmpDir = pathFn.join(__dirname, 'fs_tmp');

  before(function(){
    return fs.mkdir(tmpDir);
  });

  it('exists()', function(){
    return fs.exists(tmpDir).then(function(exist){
      exist.should.be.true;
    });
  });

  it('mkdirs()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    return fs.mkdirs(target).then(function(){
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('mkdirsSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'c');

    fs.mkdirsSync(target);

    return fs.exists(target).then(function(exist){
      exist.should.be.true;
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFile()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(target, body).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('writeFileSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    fs.writeFileSync(target, body);

    return fs.readFile(target).then(function(content){
      content.should.eql(body);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFile()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function(){
      return fs.appendFile(target, body2);
    }).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('appendFileSync()', function(){
    var target = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';
    var body2 = 'bar';

    return fs.writeFile(target, body).then(function(){
      fs.appendFileSync(target, body2);
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body + body2);
      return fs.rmdir(pathFn.join(tmpDir, 'a'));
    });
  });

  it('copyFile()', function(){
    var src = pathFn.join(tmpDir, 'test.txt');
    var dest = pathFn.join(tmpDir, 'a', 'b', 'test.txt');
    var body = 'foo';

    return fs.writeFile(src, body).then(function(){
      return fs.copyFile(src, dest);
    }).then(function(){
      return fs.readFile(dest);
    }).then(function(content){
      content.should.eql(body);

      return Promise.all([
        fs.unlink(src),
        fs.rmdir(pathFn.join(tmpDir, 'a'))
      ]);
    });
  });

  it('copyDir()', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest);
    }).then(function(files){
      files.should.eql(['a.txt', 'b.js']);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'a.txt')),
        fs.readFile(pathFn.join(dest, 'b.js'))
      ]);
    }).then(function(result){
      result.should.eql(['a', 'b']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - ignoreHidden off', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members(['a.txt', 'b.js', '.c']);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'a.txt')),
        fs.readFile(pathFn.join(dest, 'b.js')),
        fs.readFile(pathFn.join(dest, '.c'))
      ]);
    }).then(function(result){
      result.should.eql(['a', 'b', 'c']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('copyDir() - ignorePattern', function(){
    var src = pathFn.join(tmpDir, 'a');
    var dest = pathFn.join(tmpDir, 'b');

    return createDummyFolder(src).then(function(){
      return fs.copyDir(src, dest, {ignorePattern: /\.js/});
    }).then(function(files){
      files.should.have.members(['a.txt']);

      return Promise.all([
        fs.readFile(pathFn.join(dest, 'a.txt'))
      ]);
    }).then(function(result){
      result.should.eql(['a']);
    }).then(function(){
      return Promise.all([
        fs.rmdir(src),
        fs.rmdir(dest)
      ]);
    });
  });

  it('listDir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target);
    }).then(function(files){
      files.should.have.members(['a.txt', 'b.js']);
      return fs.rmdir(target);
    });
  });

  it('listDir() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members(['a.txt', 'b.js', '.c']);
      return fs.rmdir(target);
    });
  });

  it('listDir() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.listDir(target, {ignorePattern: /\.js/});
    }).then(function(files){
      files.should.have.members(['a.txt']);
      return fs.rmdir(target);
    });
  });

  it('listDirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target);
      files.should.have.members(['a.txt', 'b.js']);
      return fs.rmdir(target);
    });
  });

  it('listDirSync() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target, {ignoreHidden: false});
      files.should.have.members(['a.txt', 'b.js', '.c']);
      return fs.rmdir(target);
    });
  });

  it('listDirSync() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.listDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['a.txt']);
      return fs.rmdir(target);
    });
  });

  it('readFile()', function(){
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function(){
      return fs.readFile(target);
    }).then(function(content){
      content.should.eql(body);
      return fs.unlink(target);
    });
  });

  it('readFileSync()', function(){
    var target = pathFn.join(tmpDir, 'test.txt');
    var body = 'test';

    return fs.writeFile(target, body).then(function(){
      fs.readFileSync(target).should.eql(body);
      return fs.unlink(target);
    });
  });

  it('emptyDir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target);
    }).then(function(files){
      files.should.have.members(['a.txt', 'b.js']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, false, true]);
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {ignoreHidden: false});
    }).then(function(files){
      files.should.have.members(['a.txt', 'b.js', '.c']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, false, false]);
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {ignorePattern: /\.js/});
    }).then(function(files){
      files.should.have.members(['a.txt']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, true, true]);
      return fs.rmdir(target);
    });
  });

  it('emptyDir() - exclude', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.emptyDir(target, {exclude: ['a.txt']});
    }).then(function(files){
      files.should.have.members(['b.js']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([true, false, true]);
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target);
      files.should.have.members(['a.txt', 'b.js']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, false, true]);
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - ignoreHidden off', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target, {ignoreHidden: false});
      files.should.have.members(['a.txt', 'b.js', '.c']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, false, false]);
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - ignorePattern', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target, {ignorePattern: /\.js/});
      files.should.have.members(['a.txt']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([false, true, true]);
      return fs.rmdir(target);
    });
  });

  it('emptyDirSync() - exclude', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      var files = fs.emptyDirSync(target, {exclude: ['a.txt']});
      files.should.have.members(['b.js']);

      return Promise.all([
        fs.exists(pathFn.join(target, 'a.txt')),
        fs.exists(pathFn.join(target, 'b.js')),
        fs.exists(pathFn.join(target, '.c'))
      ]);
    }).then(function(result){
      result.should.eql([true, false, true]);
      return fs.rmdir(target);
    });
  });

  it('rmdir()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      return fs.rmdir(target);
    }).then(function(){
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.false;
    })
  });

  it('rmdirSync()', function(){
    var target = pathFn.join(tmpDir, 'test');

    return createDummyFolder(target).then(function(){
      fs.rmdirSync(target);
      return fs.exists(target);
    }).then(function(exist){
      exist.should.be.false;
    });
  });

  after(function(){
    return fs.rmdir(tmpDir);
  });
});