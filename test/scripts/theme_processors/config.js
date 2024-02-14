'use strict';

const { spy, assert: sinonAssert } = require('sinon');
const { join } = require('path');
const { mkdirs, rmdir, unlink, writeFile} = require('hexo-fs');
const Promise = require('bluebird');

describe('config', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'config_test'), {silent: true});
  const processor = require('../../../dist/theme/processors/config');
  const process = Promise.method(processor.config.process.bind(hexo));
  const themeDir = join(hexo.base_dir, 'themes', 'test');

  function newFile(options) {
    options.source = join(themeDir, options.path);
    return new hexo.theme.File(options);
  }

  before(async () => {
    await Promise.all([
      mkdirs(themeDir),
      writeFile(hexo.config_path, 'theme: test')
    ]);
    hexo.init();
  });

  beforeEach(() => { hexo.theme.config = {}; });

  after(() => rmdir(hexo.base_dir));

  it('pattern', () => {
    const pattern = processor.config.pattern;

    pattern.match('_config.yml').should.be.ok;
    pattern.match('_config.json').should.be.ok;
    should.not.exist(pattern.match('_config/foo.yml'));
    should.not.exist(pattern.match('foo.yml'));
  });

  it('type: create', async () => {
    const body = [
      'name:',
      '  first: John',
      '  last: Doe'
    ].join('\n');

    const file = newFile({
      path: '_config.yml',
      type: 'create',
      content: body
    });

    await writeFile(file.source, body);
    await process(file);
    hexo.theme.config.should.eql({
      name: {first: 'John', last: 'Doe'}
    });

    unlink(file.source);
  });

  it('type: delete', async () => {
    const file = newFile({
      path: '_config.yml',
      type: 'delete'
    });

    hexo.theme.config = {foo: 'bar'};

    await process(file);
    hexo.theme.config.should.eql({});
  });

  it('load failed', () => {
    const file = newFile({
      path: '_config.yml',
      type: 'create'
    });

    const logSpy = spy(hexo.log, 'error');

    return process(file).then(() => {
      should.fail('Return value must be rejected');
    }, () => {
      sinonAssert.calledWith(logSpy, 'Theme config load failed.');
    }).finally(() => logSpy.restore());
  });
});
