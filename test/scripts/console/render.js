'use strict';

const fs = require('hexo-fs');
const pathFn = require('path');
const Promise = require('bluebird');

describe('render', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'render_test'), {silent: true});
  const render = require('../../../lib/plugins/console/render').bind(hexo);

  before(async() => {
    await fs.mkdirs(hexo.base_dir);
    await hexo.init();
  });

  after(() => fs.rmdir(hexo.base_dir));

  const body = [
    'foo: 1',
    'bar:',
    '  boo: 2'
  ].join('\n');

  it('relative path', async() => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    await fs.writeFile(src, body);
    await render({_: ['test.yml'], output: 'result.json'});
    const result = await fs.readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      fs.unlink(src),
      fs.unlink(dest)
    ]);
  });

  it('absolute path', async() => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    await fs.writeFile(src, body);
    await render({_: [src], output: 'result.json'});

    const result = await fs.readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      fs.unlink(src),
      fs.unlink(dest)
    ]);
  });

  it('absolute output', async() => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    await fs.writeFile(src, body);
    await render({_: ['test.yml'], output: dest});

    const result = await fs.readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      fs.unlink(src),
      fs.unlink(dest)
    ]);
  });

  // it('output'); missing-unit-test

  it('engine', async() => {
    const src = pathFn.join(hexo.base_dir, 'test');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    await fs.writeFile(src, body);
    await render({_: ['test'], output: 'result.json', engine: 'yaml'});

    const result = await fs.readFile(dest);
    JSON.parse(result).should.eql({
      foo: 1,
      bar: {
        boo: 2
      }
    });

    await Promise.all([
      fs.unlink(src),
      fs.unlink(dest)
    ]);
  });

  it('pretty', async() => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    await fs.writeFile(src, body);
    await render({_: ['test.yml'], output: 'result.json', pretty: true});

    const result = await fs.readFile(dest);
    result.should.eql(JSON.stringify({
      foo: 1,
      bar: {
        boo: 2
      }
    }, null, '  '));

    await Promise.all([
      fs.unlink(src),
      fs.unlink(dest)
    ]);
  });
});
