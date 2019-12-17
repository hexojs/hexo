'use strict';

const { join } = require('path');
const { emptyDir, exists, mkdirs, readFile, rmdir, stat, unlink, writeFile } = require('hexo-fs');
const Promise = require('bluebird');
const { spy } = require('sinon');

describe('generate', () => {
  const Hexo = require('../../../lib/hexo');
  const generateConsole = require('../../../lib/plugins/console/generate');
  let hexo, generate;

  beforeEach(async() => {
    hexo = new Hexo(join(__dirname, 'generate_test'), {silent: true});
    generate = generateConsole.bind(hexo);

    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  afterEach(async() => {
    if (exists(hexo.base_dir)) {
      await emptyDir(hexo.base_dir);
      await rmdir(hexo.base_dir);
    }
  });

  const testGenerate = async options => {
    await Promise.all([
      // Add some source files
      writeFile(join(hexo.source_dir, 'test.txt'), 'test'),
      writeFile(join(hexo.source_dir, 'faz', 'yo.txt'), 'yoooo'),
      // Add some files to public folder
      writeFile(join(hexo.public_dir, 'foo.txt'), 'foo'),
      writeFile(join(hexo.public_dir, 'bar', 'boo.txt'), 'boo'),
      writeFile(join(hexo.public_dir, 'faz', 'yo.txt'), 'yo')
    ]);
    await generate(options);

    const result = await Promise.all([
      readFile(join(hexo.public_dir, 'test.txt')),
      readFile(join(hexo.public_dir, 'faz', 'yo.txt')),
      exists(join(hexo.public_dir, 'foo.txt')),
      exists(join(hexo.public_dir, 'bar', 'boo.txt'))
    ]);
    // Check the new file
    result[0].should.eql('test');
    // Check the updated file
    result[1].should.eql('yoooo');
    // Old files should not be deleted
    result[2].should.eql(true);
    result[3].should.eql(true);
  };

  it('default', () => testGenerate());

  it('write file if not exist', async() => {
    const src = join(hexo.source_dir, 'test.txt');
    const dest = join(hexo.public_dir, 'test.txt');
    const content = 'test';

    // Add some source files
    await writeFile(src, content);

    // First generation
    await generate();

    // Delete generated files
    await unlink(dest);

    // Second generation
    await generate();

    const result = await readFile(dest);

    result.should.eql(content);

    // Remove source files and generated files
    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('don\'t write if file unchanged', async() => {
    const src = join(hexo.source_dir, 'test.txt');
    const dest = join(hexo.public_dir, 'test.txt');
    const content = 'test';
    const newContent = 'newtest';

    // Add some source files
    await writeFile(src, content);

    // First generation
    await generate();

    // Change the generated file
    await writeFile(dest, newContent);

    // Second generation
    await generate();

    // Read the generated file
    const result = await readFile(dest);

    // Make sure the generated file didn't change
    result.should.eql(newContent);

    // Remove source files and generated files
    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('force regenerate', async() => {
    const src = join(hexo.source_dir, 'test.txt');
    const dest = join(hexo.public_dir, 'test.txt');
    const content = 'test';

    await writeFile(src, content);

    // First generation
    await generate();

    // Read file status
    let stats = await stat(dest);
    const mtime = stats.mtime.getTime();

    await Promise.delay(1000);

    // Force regenerate
    await generate({ force: true });
    stats = await stat(dest);

    stats.mtime.getTime().should.above(mtime);

    // Remove source files and generated files
    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('watch - update', async() => {
    const src = join(hexo.source_dir, 'test.txt');
    const dest = join(hexo.public_dir, 'test.txt');
    const content = 'test';

    await testGenerate({ watch: true });

    // Update the file
    await writeFile(src, content);

    await Promise.delay(300);

    // Check the updated file
    const result = await readFile(dest);
    result.should.eql(content);

    // Stop watching
    await hexo.unwatch();
  });

  it('watch - delete', async() => {
    await testGenerate({ watch: true });

    await unlink(join(hexo.source_dir, 'test.txt'));
    await Promise.delay(300);

    const exist = await exists(join(hexo.public_dir, 'test.txt'));
    exist.should.eql(false);
  });

  it('deploy', async() => {
    const deployer = spy();

    hexo.extend.deployer.register('test', deployer);

    hexo.config.deploy = {
      type: 'test'
    };

    await generate({ deploy: true });

    deployer.calledOnce.should.eql(true);
  });

  it('update theme source files', async() => {
    // Add some source files
    await Promise.all([
      // Add some source files
      writeFile(join(hexo.theme_dir, 'source', 'a.txt'), 'a'),
      writeFile(join(hexo.theme_dir, 'source', 'b.txt'), 'b'),
      writeFile(join(hexo.theme_dir, 'source', 'c.swig'), 'c')
    ]);
    await generate();

    // Update source file
    await Promise.all([
      writeFile(join(hexo.theme_dir, 'source', 'b.txt'), 'bb'),
      writeFile(join(hexo.theme_dir, 'source', 'c.swig'), 'cc')
    ]);

    // Generate again
    await generate();

    // Read the updated source file
    const result = await Promise.all([
      readFile(join(hexo.public_dir, 'b.txt')),
      readFile(join(hexo.public_dir, 'c.html'))
    ]);

    result[0].should.eql('bb');
    result[1].should.eql('cc');
  });

  it('proceeds after error when bail option is not set', async() => {
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

    await Promise.all([
      writeFile(join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]);
    return generate();
  });

  it('proceeds after error when bail option is set to false', async() => {
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

    await Promise.all([
      writeFile(join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]);
    return generate({ bail: false });
  });

  it('breaks after error when bail option is set to true', async() => {
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

    const errorCallback = spy(err => {
      err.should.have.property('message', 'Testing unhandled exception');
    });

    await Promise.all([
      writeFile(join(hexo.theme_dir, 'layout', 'post.err'), 'post')
    ]);

    return generate({ bail: true }).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('should generate all files even when concurrency is set', async() => {
    await generate({ concurrency: 1 });
    return generate({ concurrency: 2 });
  });
});
