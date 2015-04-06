'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('generate', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'generate_test'), {silent: true});
  var generate = require('../../../lib/plugins/console/generate').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    });
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  afterEach(function(){
    return Promise.all([
      // Delete the public folder
      fs.rmdir(hexo.public_dir),
      // Clean cache
      hexo.model('Cache').remove({}),
      hexo.model('Asset').remove({})
    ]);
  });

  function testGenerate(options){
    options = options || {};

    return Promise.all([
      // Add some source files
      fs.writeFile(pathFn.join(hexo.source_dir, 'test.txt'), 'test'),
      fs.writeFile(pathFn.join(hexo.source_dir, 'faz', 'yo.txt'), 'yoooo'),
      // Add some files to public folder
      fs.writeFile(pathFn.join(hexo.public_dir, 'foo.txt'), 'foo'),
      fs.writeFile(pathFn.join(hexo.public_dir, 'bar', 'boo.txt'), 'boo'),
      fs.writeFile(pathFn.join(hexo.public_dir, 'faz', 'yo.txt'), 'yo')
    ]).then(function(){
      return generate(options);
    }).then(function(){
      return Promise.all([
        fs.readFile(pathFn.join(hexo.public_dir, 'test.txt')),
        fs.readFile(pathFn.join(hexo.public_dir, 'faz', 'yo.txt')),
        fs.exists(pathFn.join(hexo.public_dir, 'foo.txt')),
        fs.exists(pathFn.join(hexo.public_dir, 'bar', 'boo.txt'))
      ]);
    }).then(function(result){
      // Check the new file
      result[0].should.eql('test');

      // Check the updated file
      result[1].should.eql('yoooo');

      // Old files should be deleted
      result[2].should.be.false;
      result[3].should.be.false;
    });
  }

  it('default', function(){
    return testGenerate();
  });

  it('write file if not exist', function(){
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';

    // Add some source files
    return fs.writeFile(src, content).then(function(){
      // First generation
      return generate({});
    }).then(function(){
      // Delete generated files
      return fs.unlink(dest);
    }).then(function(){
      // Second generation
      return generate({});
    }).then(function(){
      return fs.readFile(dest);
    }).then(function(result){
      result.should.eql(content);

      // Remove source files and generated files
      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('don\'t write if file unchanged', function(){
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';
    var newContent = 'newtest';

    // Add some source files
    return fs.writeFile(src, content).then(function(){
      // First generation
      return generate({});
    }).then(function(){
      // Change the generated file
      return fs.writeFile(dest, newContent);
    }).then(function(){
      // Second generation
      return generate({});
    }).then(function(){
      // Read the generated file
      return fs.readFile(dest);
    }).then(function(result){
      // Make sure the generated file didn't changed
      result.should.eql(newContent);

      // Remove source files and generated files
      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('watch - update', function(){
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';

    return testGenerate({watch: true}).then(function(){
      // Update the file
      return fs.writeFile(src, content);
    }).delay(300).then(function(){
      return fs.readFile(dest);
    }).then(function(result){
      // Check the updated file
      result.should.eql(content);

      // Stop watching
      hexo.unwatch();
    });
  });

  it('watch - delete', function(){
    return testGenerate({watch: true}).then(function(){
      return fs.unlink(pathFn.join(hexo.source_dir, 'test.txt'));
    }).delay(300).then(function(){
      return fs.exists(pathFn.join(hexo.public_dir, 'test.txt'));
    }).then(function(exist){
      exist.should.be.false;

      // Stop watching
      hexo.unwatch();
    });
  });

  it('deploy', function(){
    var deployer = sinon.spy();

    hexo.extend.deployer.register('test', deployer);

    hexo.config.deploy = {
      type: 'test'
    };

    return generate({deploy: true}).then(function(){
      deployer.calledOnce.should.be.true;
    });
  });

  it('update theme source files', function(){
    return Promise.all([
      // Add some source files
      fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'a.txt'), 'a'),
      fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'b.txt'), 'b'),
      fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'c.swig'), 'c')
    ]).then(function(){
      return generate({});
    }).then(function(){
      // Update source file
      return Promise.all([
        fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'b.txt'), 'bb'),
        fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'c.swig'), 'cc')
      ]);
    }).then(function(){
      // Generate again
      return generate({});
    }).then(function(){
      // Read the updated source file
      return Promise.all([
        fs.readFile(pathFn.join(hexo.public_dir, 'b.txt')),
        fs.readFile(pathFn.join(hexo.public_dir, 'c.html'))
      ]);
    }).then(function(result){
      console.log(result)
    });
  });
});