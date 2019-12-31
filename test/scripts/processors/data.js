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

  const typeOf = str => typeof str;

  function newFile(options) {
    const path = options.path;

    options.params = {
      path
    };

    options.path = '_data/' + path;
    options.source = pathFn.join(source.base, options.path);

    return new File(options);
  }

  before(async () => {
    await fs.mkdirs(baseDir);
    hexo.init();
  });

  after(() => fs.rmdir(baseDir));

  it('pattern', () => {
    const pattern = processor.pattern;

    pattern.match('_data/users.json').should.eql({
      0: '_data/users.json',
      1: 'users.json',
      path: 'users.json'
    });

    pattern.match('_data/users.yaml').should.eql({
      0: '_data/users.yaml',
      1: 'users.yaml',
      path: 'users.yaml'
    });

    typeOf(pattern.match('users.json')).should.eql('undefined');
  });

  it('type: create - yaml', async () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'create'
    });

    await fs.writeFile(file.source, body);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 'bar'});

    data.remove();
    fs.unlink(file.source);
  });

  it('type: create - json', async () => {
    const body = '{"foo": 1}';

    const file = newFile({
      path: 'users.json',
      type: 'create'
    });

    await fs.writeFile(file.source, body);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 1});

    data.remove();
    fs.unlink(file.source);
  });

  it('type: create - others', async () => {
    const file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    await fs.writeFile(file.source, 'text');
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql('text');

    data.remove();
    fs.unlink(file.source);
  });

  it('type: update', async () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'update'
    });

    await Promise.all([
      fs.writeFile(file.source, body),
      Data.insert({
        _id: 'users',
        data: {}
      })
    ]);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 'bar'});

    data.remove();
    fs.unlink(file.source);
  });

  it('type: delete', async () => {
    const file = newFile({
      path: 'users.yml',
      type: 'delete'
    });

    await Data.insert({
      _id: 'users',
      data: {foo: 'bar'}
    });
    await process(file);
    typeOf(Data.findById('users')).should.eql('undefined');
  });
});
