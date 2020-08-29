'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');

describe('Scaffold', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const scaffold = hexo.scaffold;
  const scaffoldDir = hexo.scaffold_dir;

  const testContent = [
    '---',
    'title: {{ title }}',
    '---',
    'test scaffold'
  ].join('\n');

  const testPath = pathFn.join(scaffoldDir, 'test.md');

  before(async () => {
    await hexo.init();
    await fs.writeFile(testPath, testContent);
  });

  after(() => fs.rmdir(scaffoldDir));

  it('get() - file exists', async () => {
    const data = await scaffold.get('test');
    data.should.eql(testContent);
  });

  it('get() - normal scaffold', async () => {
    const data = await scaffold.get('normal');
    data.should.eql(scaffold.defaults.normal);
  });

  it('set() - file exists', async () => {
    await scaffold.set('test', 'foo');

    const file = await fs.readFile(testPath);
    const data = await scaffold.get('test');
    file.should.eql('foo');
    data.should.eql('foo');

    await fs.writeFile(testPath, testContent);
  });

  it('set() - file does not exist', async () => {
    const testPath = pathFn.join(scaffoldDir, 'foo.md');

    await scaffold.set('foo', 'bar');
    const file = await fs.readFile(testPath);
    const data = await scaffold.get('foo');
    file.should.eql('bar');
    data.should.eql('bar');
    await fs.unlink(testPath);
  });

  it('remove() - file exist', async () => {
    await scaffold.remove('test');
    const exist = await fs.exists(testPath);
    const data = await scaffold.get('test');
    exist.should.be.false;
    should.not.exist(data);

    await fs.writeFile(testPath, testContent);
  });

  it('remove() - file does not exist', () => scaffold.remove('foo'));
});
