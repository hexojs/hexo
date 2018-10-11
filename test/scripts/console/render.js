const should = require('chai').should(); // eslint-disable-line
const fs = require('hexo-fs');
const pathFn = require('path');
const Promise = require('bluebird');

describe('render', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'render_test'), {silent: true});
  const render = require('../../../lib/plugins/console/render').bind(hexo);

  before(() => fs.mkdirs(hexo.base_dir).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  const body = [
    'foo: 1',
    'bar:',
    '  boo: 2'
  ].join('\n');

  it('relative path', () => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    return fs.writeFile(src, body).then(() => render({_: ['test.yml'], output: 'result.json'})).then(() => fs.readFile(dest)).then(result => {
      JSON.parse(result).should.eql({
        foo: 1,
        bar: {
          boo: 2
        }
      });

      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('absolute path', () => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    return fs.writeFile(src, body).then(() => render({_: [src], output: 'result.json'})).then(() => fs.readFile(dest)).then(result => {
      JSON.parse(result).should.eql({
        foo: 1,
        bar: {
          boo: 2
        }
      });

      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('absolute output', () => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    return fs.writeFile(src, body).then(() => render({_: ['test.yml'], output: dest})).then(() => fs.readFile(dest)).then(result => {
      JSON.parse(result).should.eql({
        foo: 1,
        bar: {
          boo: 2
        }
      });

      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('output');

  it('engine', () => {
    const src = pathFn.join(hexo.base_dir, 'test');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    return fs.writeFile(src, body).then(() => render({_: ['test'], output: 'result.json', engine: 'yaml'})).then(() => fs.readFile(dest)).then(result => {
      JSON.parse(result).should.eql({
        foo: 1,
        bar: {
          boo: 2
        }
      });

      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });

  it('pretty', () => {
    const src = pathFn.join(hexo.base_dir, 'test.yml');
    const dest = pathFn.join(hexo.base_dir, 'result.json');

    return fs.writeFile(src, body).then(() => render({_: ['test.yml'], output: 'result.json', pretty: true})).then(() => fs.readFile(dest)).then(result => {
      result.should.eql(JSON.stringify({
        foo: 1,
        bar: {
          boo: 2
        }
      }, null, '  '));

      return Promise.all([
        fs.unlink(src),
        fs.unlink(dest)
      ]);
    });
  });
});
