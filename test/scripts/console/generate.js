var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var sinon = require('sinon');

describe('generate', () => {
  var Hexo = require('../../../lib/hexo');
  var generateConsole = require('../../../lib/plugins/console/generate');
  var hexo,
    generate;

  beforeEach(() => {
    hexo = new Hexo(pathFn.join(__dirname, 'generate_test'), {silent: true});
    generate = generateConsole.bind(hexo);

    return fs.mkdirs(hexo.base_dir).then(() => hexo.init());
  });

  afterEach(() => fs.rmdir(hexo.base_dir));

  function testGenerate(options) {

    return Promise.all([
      // Add some source files
      fs.writeFile(pathFn.join(hexo.source_dir, 'test.txt'), 'test'),
      fs.writeFile(pathFn.join(hexo.source_dir, 'faz', 'yo.txt'), 'yoooo'),
      // Add some files to public folder
      fs.writeFile(pathFn.join(hexo.public_dir, 'foo.txt'), 'foo'),
      fs.writeFile(pathFn.join(hexo.public_dir, 'bar', 'boo.txt'), 'boo'),
      fs.writeFile(pathFn.join(hexo.public_dir, 'faz', 'yo.txt'), 'yo')
    ]).then(() => generate(options)).then(() => Promise.all([
      fs.readFile(pathFn.join(hexo.public_dir, 'test.txt')),
      fs.readFile(pathFn.join(hexo.public_dir, 'faz', 'yo.txt')),
      fs.exists(pathFn.join(hexo.public_dir, 'foo.txt')),
      fs.exists(pathFn.join(hexo.public_dir, 'bar', 'boo.txt'))
    ])).then(result => {
      // Check the new file
      result[0].should.eql('test');

      // Check the updated file
      result[1].should.eql('yoooo');

      // Old files should not be deleted
      result[2].should.be.true;
      result[3].should.be.true;
    });
  }

  it('default', () => testGenerate());

  it('write file if not exist', () => {
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';

    // Add some source files
    return fs.writeFile(src, content).then(() => // First generation
      generate()).then(() => // Delete generated files
      fs.unlink(dest)).then(() => // Second generation
      generate()).then(() => fs.readFile(dest)).then(result => {
      result.should.eql(content);

      // Remove source files and generated files
      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('don\'t write if file unchanged', () => {
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';
    var newContent = 'newtest';

    // Add some source files
    return fs.writeFile(src, content).then(() => // First generation
      generate()).then(() => // Change the generated file
      fs.writeFile(dest, newContent)).then(() => // Second generation
      generate()).then(() => // Read the generated file
      fs.readFile(dest)).then(result => {
      // Make sure the generated file didn't changed
      result.should.eql(newContent);

      // Remove source files and generated files
      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('force regenerate', () => {
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';
    var mtime;

    return fs.writeFile(src, content).then(() => // First generation
      generate()).then(() => // Read file status
      fs.stat(dest)).then(stats => {
      mtime = stats.mtime.getTime();
    }).delay(1000).then(() => // Force regenerate
      generate({force: true})).then(() => fs.stat(dest)).then(stats => {
      stats.mtime.getTime().should.be.above(mtime);

      // Remove source files and generated files
      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('watch - update', () => {
    var src = pathFn.join(hexo.source_dir, 'test.txt');
    var dest = pathFn.join(hexo.public_dir, 'test.txt');
    var content = 'test';

    return testGenerate({watch: true}).then(() => // Update the file
      fs.writeFile(src, content)).delay(300).then(() => fs.readFile(dest)).then(result => {
      // Check the updated file
      result.should.eql(content);
    }).finally(() => {
      // Stop watching
      hexo.unwatch();
    });
  });

  it('watch - delete', () => testGenerate({watch: true}).then(() => fs.unlink(pathFn.join(hexo.source_dir, 'test.txt'))).delay(300).then(() => fs.exists(pathFn.join(hexo.public_dir, 'test.txt'))).then(exist => {
    exist.should.be.false;
  }).finally(() => {
    // Stop watching
    hexo.unwatch();
  }));

  it('deploy', () => {
    var deployer = sinon.spy();

    hexo.extend.deployer.register('test', deployer);

    hexo.config.deploy = {
      type: 'test'
    };

    return generate({deploy: true}).then(() => {
      deployer.calledOnce.should.be.true;
    });
  });

  it('update theme source files', () => Promise.all([
    // Add some source files
    fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'a.txt'), 'a'),
    fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'b.txt'), 'b'),
    fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'c.swig'), 'c')
  ]).then(() => generate()).then(() => // Update source file
    Promise.all([
      fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'b.txt'), 'bb'),
      fs.writeFile(pathFn.join(hexo.theme_dir, 'source', 'c.swig'), 'cc')
    ])).then(() => // Generate again
    generate()).then(() => // Read the updated source file
    Promise.all([
      fs.readFile(pathFn.join(hexo.public_dir, 'b.txt')),
      fs.readFile(pathFn.join(hexo.public_dir, 'c.html'))
    ])).then(result => {
    result[0].should.eql('bb');
    result[1].should.eql('cc');
  }));

  it('proceeds after error when bail option is not set', () => {
    hexo.extend.renderer.register('err', 'html', () => Promise.reject(new Error('Testing unhandled exception')));
    hexo.extend.generator.register('test_page', () =>
      [
        {
          path: 'testing-path',
          layout: 'post',
          data: {}
        }
      ]
    );

    return Promise.all([
      fs.writeFile(pathFn.join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]).then(() => {
      return generate();
    });
  });

  it('proceeds after error when bail option is set to false', () => {
    hexo.extend.renderer.register('err', 'html', () => Promise.reject(new Error('Testing unhandled exception')));
    hexo.extend.generator.register('test_page', () =>
      [
        {
          path: 'testing-path',
          layout: 'post',
          data: {}
        }
      ]
    );

    return Promise.all([
      fs.writeFile(pathFn.join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]).then(() => {
      return generate({bail: false});
    });
  });

  it('breaks after error when bail option is set to true', () => {
    hexo.extend.renderer.register('err', 'html', () => Promise.reject(new Error('Testing unhandled exception')));
    hexo.extend.generator.register('test_page', () =>
      [
        {
          path: 'testing-path',
          layout: 'post',
          data: {}
        }
      ]
    );

    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'Testing unhandled exception');
    });

    return Promise.all([
      fs.writeFile(pathFn.join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]).then(() => {
      return generate({bail: true}).catch(errorCallback).finally(() => {
        errorCallback.calledOnce.should.be.true;
      });
    });
  });
});
