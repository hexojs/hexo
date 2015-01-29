'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var sinon = require('sinon');
var testUtil = require('../../util');

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

  it('generate big files');

  it('skip generating');

  it('watch - update', function(){
    return testGenerate({watch: true}).then(function(){
      // Update the file
      return fs.writeFile(pathFn.join(hexo.source_dir, 'test.txt'), 'newtest');
    }).delay(300).then(function(){
      return fs.readFile(pathFn.join(hexo.public_dir, 'test.txt'));
    }).then(function(content){
      // Check the updated file
      content.should.eql('newtest');

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
});