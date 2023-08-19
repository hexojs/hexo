'use strict';

const { join } = require('path');
const { rmdir, stat, statSync, writeFile } = require('hexo-fs');
const { load } = require('js-yaml');

describe('File', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const Box = require('../../../dist/box').default;
  const box = new Box(hexo, join(hexo.base_dir, 'file_test'));
  const { File } = box;

  const body = [
    'name:',
    '  first: John',
    '  last: Doe',
    '',
    'age: 23',
    '',
    'list:',
    '- Apple',
    '- Banana'
  ].join('\n');

  const obj = load(body);
  const path = 'test.yml';

  const makeFile = (path, props) => {
    return new File(Object.assign({
      source: join(box.base, path),
      path
    }, props));
  };

  const file = makeFile(path, {
    source: join(box.base, path),
    path,
    type: 'create',
    params: {foo: 'bar'}
  });

  before(async () => {
    await Promise.all([
      writeFile(file.source, body),
      hexo.init()
    ]);
    stat(file.source);
  });

  after(() => rmdir(box.base));

  it('read()', async () => {
    const result = await file.read();
    result.should.eql(body);
  });

  it('readSync()', () => {
    file.readSync().should.eql(body);
  });

  it('stat()', async () => {
    const stats = await Promise.all([
      stat(file.source),
      file.stat()
    ]);
    stats[0].should.eql(stats[1]);
  });

  it('statSync()', () => {
    file.statSync().should.eql(statSync(file.source));
  });

  it('render()', async () => {
    const result = await file.render();
    result.should.eql(obj);
  });

  it('renderSync()', () => {
    file.renderSync().should.eql(obj);
  });
});
