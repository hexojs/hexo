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

  function checkStream(stream, expected) {
    return testUtil.stream.read(stream).then(data => {
      data.should.eql(expected);
    });
  }

  before(() => fs.mkdirs(hexo.base_dir).then(() => hexo.init()));

  after(() => fs.rmdir(hexo.base_dir));

  it('renderable', () => {
    const path = 'test.yml';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'foo: bar';

    return Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, content)
    ]).then(() => generator(hexo.locals)).then(data => {
      data[0].path.should.eql('test.json');
      data[0].data.modified.should.be.true;

      return data[0].data.data().then(result => {
        result.should.eql('{"foo":"bar"}');
      });
    }).then(() => Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]));
  });

  it('not renderable', () => {
    const path = 'test.txt';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'test content';

    return Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, content)
    ]).then(() => generator(hexo.locals)).then(data => {
      data[0].path.should.eql(path);
      data[0].data.modified.should.be.true;

      return checkStream(data[0].data.data(), content);
    }).then(() => Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]));
  });

  it('skip render', () => {
    const path = 'test.yml';
    const source = pathFn.join(hexo.base_dir, path);
    const content = 'foo: bar';

    return Promise.all([
      Asset.insert({_id: path, path, renderable: false}),
      fs.writeFile(source, content)
    ]).then(() => generator(hexo.locals)).then(data => {
      data[0].path.should.eql('test.yml');
      data[0].data.modified.should.be.true;

      return checkStream(data[0].data.data(), content);
    }).then(() => Promise.all([
      Asset.removeById(path),
      fs.unlink(source)
    ]));
  });

  it('remove assets which does not exist', () => {
    const path = 'test.txt';

    return Asset.insert({
      _id: path,
      path
    }).then(() => generator(hexo.locals)).then(() => {
      should.not.exist(Asset.findById(path));
    });
  });

  it('don\'t remove extension name', () => {
    const path = 'test.min.js';
    const source = pathFn.join(hexo.base_dir, path);

    return Promise.all([
      Asset.insert({_id: path, path}),
      fs.writeFile(source, '')
    ]).then(() => generator(hexo.locals)).then(data => {
      data[0].path.should.eql('test.min.js');

      return Promise.all([
        Asset.removeById(path),
        fs.unlink(source)
      ]);
    });
  });
});
