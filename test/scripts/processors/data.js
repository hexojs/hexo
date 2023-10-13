'use strict';

const Promise = require('bluebird');
const { mkdirs, rmdir, unlink, writeFile } = require('hexo-fs');
const { join } = require('path');

describe('data', () => {
  const Hexo = require('../../../dist/hexo');
  const baseDir = join(__dirname, 'data_test');
  const hexo = new Hexo(baseDir);
  const processor = require('../../../dist/plugins/processor/data')(hexo);
  const process = Promise.method(processor.process).bind(hexo);
  const { source } = hexo;
  const { File } = source;
  const Data = hexo.model('Data');

  function newFile(options) {
    const path = options.path;

    options.params = {
      path
    };

    options.path = '_data/' + path;
    options.source = join(source.base, options.path);

    return new File(options);
  }

  before(async () => {
    await mkdirs(baseDir);
    hexo.init();
  });

  after(() => rmdir(baseDir));

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

    should.not.exist(pattern.match('users.json'));
  });

  it('type: create - yaml', async () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 'bar'});

    data.remove();
    unlink(file.source);
  });

  it('type: create - json', async () => {
    const body = '{"foo": 1}';

    const file = newFile({
      path: 'users.json',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 1});

    data.remove();
    unlink(file.source);
  });

  it('type: create - others', async () => {
    const file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    await writeFile(file.source, 'text');
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql('text');

    data.remove();
    unlink(file.source);
  });

  it('type: update', async () => {
    const body = 'foo: bar';

    const file = newFile({
      path: 'users.yml',
      type: 'update'
    });

    await Promise.all([
      writeFile(file.source, body),
      Data.insert({
        _id: 'users',
        data: {}
      })
    ]);
    await process(file);
    const data = Data.findById('users');

    data.data.should.eql({foo: 'bar'});

    data.remove();
    unlink(file.source);
  });

  it('type: skip', async () => {
    const file = newFile({
      path: 'users.yml',
      type: 'skip'
    });

    await Data.insert({
      _id: 'users',
      data: {foo: 'bar'}
    });
    const data = Data.findById('users');
    await process(file);
    should.exist(data);
    data.remove();
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
    should.not.exist(Data.findById('users'));
  });

  it('type: delete - not exist', async () => {
    const file = newFile({
      path: 'users.yml',
      type: 'delete'
    });

    await process(file);
    should.not.exist(Data.findById('users'));
  });

});
