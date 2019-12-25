'use strict';

const Promise = require('bluebird');
const pathFn = require('path');
const fs = require('hexo-fs');
const testUtil = require('../../util');

describe('asset', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'asset_test'), {silent: true});
  const generator = require('../../../lib/plugins/generator/asset').bind(hexo);
  const Asset = hexo.model('Asset');

  async function checkStream(stream, expected) {
    const data = await testUtil.stream.read(stream);
    data.should.eql(expected);
  }

  before(async () => {
    await fs.mkdirs(hexo.base_dir);
    hexo.init();
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('renderable', async () => {
    const path = 'test.yml';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'foo: bar';

    await Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, content)
    ]);
    const data = await generator(hexo.locals);
    data[0].path.should.eql('test.json');
    data[0].data.modified.should.be.true;

    const result = await data[0].data.data();
    result.should.eql('{"foo":"bar"}');

    await Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]);
  });

  it('not renderable', async () => {
    const path = 'test.txt';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'test content';

    await Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, content)
    ]);
    const data = await generator(hexo.locals);
    data[0].path.should.eql(path);
    data[0].data.modified.should.be.true;

    await checkStream(data[0].data.data(), content);

    await Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]);
  });

  it('skip render', async () => {
    const path = 'test.yml';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'foo: bar';

    await Promise.all([
      Asset.insert({_id: path, path, renderable: false}),
      fs.writeFile(source, content)
    ]);
    const data = await generator(hexo.locals);
    data[0].path.should.eql('test.yml');
    data[0].data.modified.should.be.true;

    await checkStream(data[0].data.data(), content);
    await Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]);
  });

  it('remove assets which does not exist', async () => {
    const path = 'test.txt';

    await Asset.insert({
      _id: path,
      path
    });
    await generator(hexo.locals);
    should.not.exist(Asset.findById(path));
  });

  it('don\'t remove extension name', async () => {
    const path = 'test.min.js';
    const source = pathFn.join(hexo.base_dir, path);

    await Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, '')
    ]);
    const data = await generator(hexo.locals);
    data[0].path.should.eql('test.min.js');

    await Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]);
  });
});
