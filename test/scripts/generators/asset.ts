import { join } from 'path';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import { readStream } from '../../util';
import Hexo from '../../../lib/hexo';
import assetGenerator from '../../../lib/plugins/generator/asset';
import { spy } from 'sinon';
import chai from 'chai';
const should = chai.should();
type AssetParams = Parameters<typeof assetGenerator>
type AssetReturn = ReturnType<typeof assetGenerator>

describe('asset', () => {
  const hexo = new Hexo(join(__dirname, 'asset_test'), {silent: true});
  const generator: (...args: AssetParams) => AssetReturn = assetGenerator.bind(hexo);
  const Asset = hexo.model('Asset');

  const checkStream = async (stream, expected) => {
    const data = await readStream(stream);
    data.should.eql(expected);
  };

  before(async () => {
    await mkdirs(hexo.base_dir);
    hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('renderable', async () => {
    const path = 'test.yml';
    const source = join(hexo.base_dir, path);
    const content = 'foo: bar';

    await Promise.all([
      Asset.insert({_id: path, path}),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql('test.json');
    data[0].data.modified.should.be.true;

    const result = await data[0].data.data!();
    result.should.eql('{"foo":"bar"}');

    await Promise.all([
      Asset.removeById(path),
      unlink(source)
    ]);
  });

  it('renderable - error', async () => {
    const logSpy = spy();
    hexo.log.error = logSpy;
    const path = 'test.yml';
    const source = join(hexo.base_dir, path);
    const content = 'foo: :';

    await Promise.all([
      Asset.insert({_id: path, path}),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql('test.json');
    data[0].data.modified.should.be.true;
    await data[0].data.data!();
    logSpy.called.should.be.true;

    logSpy.args[0][1].should.contains('Asset render failed: %s');
    logSpy.args[0][2].should.contains('test.json');
    await Promise.all([
      Asset.removeById(path),
      unlink(source)
    ]);
  });

  it('not renderable', async () => {
    const path = 'test.txt';
    const source = join(hexo.base_dir, path);
    const content = 'test content';

    await Promise.all([
      Asset.insert({_id: path, path}),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql(path);
    data[0].data.modified.should.be.true;

    await checkStream(data[0].data.data!(), content);

    await Promise.all([
      Asset.removeById(path),
      unlink(source)
    ]);
  });

  it('skip render', async () => {
    const path = 'test.yml';
    const source = join(hexo.base_dir, path);
    const content = 'foo: bar';

    await Promise.all([
      Asset.insert({_id: path, path, renderable: false}),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql('test.yml');
    data[0].data.modified.should.be.true;

    await checkStream(data[0].data.data!(), content);
    await Promise.all([
      Asset.removeById(path),
      unlink(source)
    ]);
  });

  it('remove assets which does not exist', async () => {
    const path = 'test.txt';

    await Asset.insert({
      _id: path,
      path
    });
    await generator();
    should.not.exist(Asset.findById(path));
  });

  it('don\'t remove extension name', async () => {
    const path = 'test.min.js';
    const source = join(hexo.base_dir, path);

    await Promise.all([
      Asset.insert({_id: path, path}),
      writeFile(source, '')
    ]);
    const data = await generator();
    data[0].path.should.eql('test.min.js');

    await Promise.all([
      Asset.removeById(path),
      unlink(source)
    ]);
  });
});
