'use strict';

const Promise = require('bluebird');
const fs = require('hexo-fs');
const pathFn = require('path');

describe('data', () => {
  const Hexo = require('../../../lib/hexo');
  const baseDir = pathFn.join(__dirname, 'data_test');
  const hexo = new Hexo(baseDir);
  const processor = require('../../../lib/plugins/processor/data')(hexo);
  const process = Promise.method(processor.process).bind(hexo);
  const source = hexo.source;
  const File = source.File;
  const Data = hexo.model('Data');

  function newFile(options) {
    const path = options.path;

    options.params = {
      path
    };

    options.path = '_data/' + path;
    options.source = pathFn.join(source.base, options.path);

    return new File(options);
  }

  before(() => fs.mkdirs(baseDir).then(() => hexo.init()));

  after(() => fs.rmdir(baseDir));

  it('pattern', () => {
    const pattern = processor.pattern;

    pattern.match('_data/users.json').should.be.ok;
    pattern.match('_data/users.yaml').should.be.ok;
    should.not.exist(pattern.match('users.json'));
  });

  it('type: create - yaml', () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'create'
    });

    return fs
      .writeFile(file.source, body)
      .then(() => process(file))
      .then(() => {
        const data = Data.findById('users');

        data.data.should.eql({ foo: 'bar' });

        return data.remove();
      })
      .finally(() => fs.unlink(file.source));
  });

  it('type: create - json', () => {
    const body = '{"foo": 1}';

    const file = newFile({
      path: 'users.json',
      type: 'create'
    });

    return fs
      .writeFile(file.source, body)
      .then(() => process(file))
      .then(() => {
        const data = Data.findById('users');

        data.data.should.eql({ foo: 1 });

        return data.remove();
      })
      .finally(() => fs.unlink(file.source));
  });

  it('type: create - others', () => {
    const file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    return fs
      .writeFile(file.source, 'text')
      .then(() => process(file))
      .then(() => {
        const data = Data.findById('users');

        data.data.should.eql('text');

        return data.remove();
      })
      .finally(() => fs.unlink(file.source));
  });

  it('type: update', () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'update'
    });

    return Promise.all([
      fs.writeFile(file.source, body),
      Data.insert({
        _id: 'users',
        data: {}
      })
    ])
      .then(() => process(file))
      .then(() => {
        const data = Data.findById('users');

        data.data.should.eql({ foo: 'bar' });

        return data.remove();
      })
      .finally(() => fs.unlink(file.source));
  });

  it('type: delete', () => {
    const file = newFile({
      path: 'users.yml',
      type: 'delete'
    });

    return Data.insert({
      _id: 'users',
      data: { foo: 'bar' }
    })
      .then(() => process(file))
      .then(() => {
        should.not.exist(Data.findById('users'));
      });
  });
});
