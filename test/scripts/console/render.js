'use strict';

const { mkdirs, readFile, rmdir, unlink, writeFile } = require('hexo-fs');
const { join } = require('path');
const Promise = require('bluebird');
const { spy } = require('sinon');

describe('render', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(join(__dirname, 'render_test'), {silent: true});
  const render = require('../../../dist/plugins/console/render').bind(hexo);

  before(async () => {
    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  const body = [
    'foo: 1',
    'bar:',
    '  boo: 2'
  ].join('\n');

  it('no args', async () => {
    const hexo = new Hexo(join(__dirname, 'render_test'), {silent: true});
    hexo.call = spy();
    const render = require('../../../dist/plugins/console/render').bind(hexo);

    await render({_: []});

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._.should.eql('render');
  });

  it('relative path', async () => {
    const src = join(hexo.base_dir, 'test.yml');
    const dest = join(hexo.base_dir, 'result.json');

    await writeFile(src, body);
    await render({_: ['test.yml'], output: 'result.json'});
    const result = await readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('absolute path', async () => {
    const src = join(hexo.base_dir, 'test.yml');
    const dest = join(hexo.base_dir, 'result.json');

    await writeFile(src, body);
    await render({_: [src], output: 'result.json'});

    const result = await readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('absolute output', async () => {
    const src = join(hexo.base_dir, 'test.yml');
    const dest = join(hexo.base_dir, 'result.json');

    await writeFile(src, body);
    await render({_: ['test.yml'], output: dest});

    const result = await readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  // it('output'); missing-unit-test

  it('engine', async () => {
    const src = join(hexo.base_dir, 'test');
    const dest = join(hexo.base_dir, 'result.json');

    await writeFile(src, body);
    await render({_: ['test'], output: 'result.json', engine: 'yaml'});

    const result = await readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });

  it('pretty', async () => {
    const src = join(hexo.base_dir, 'test.yml');
    const dest = join(hexo.base_dir, 'result.json');

    await writeFile(src, body);
    await render({_: ['test.yml'], output: 'result.json', pretty: true});

    const result = await readFile(dest);
    result.should.eql(JSON.stringify({
      foo: 1,
      bar: {
        boo: 2
      }
    }, null, '  '));

    await Promise.all([
      unlink(src),
      unlink(dest)
    ]);
  });
});
