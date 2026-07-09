import { join } from 'path';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import codeGenerator from '../../../lib/plugins/generator/code';
import defaults from '../../../lib/hexo/default_config';
import chai from 'chai';
const should = chai.should();
type CodeParams = Parameters<typeof codeGenerator>
type CodeReturn = ReturnType<typeof codeGenerator>

describe('code', () => {
  const hexo = new Hexo(join(__dirname, 'code_test'), {silent: true});
  const generator: (...args: CodeParams) => CodeReturn = codeGenerator.bind(hexo);
  const Code = hexo.model('Code');
  const codeDir = defaults.code_dir;

  before(async () => {
    await mkdirs(hexo.base_dir);
    await hexo.init();
  });

  after(() => rmdir(hexo.base_dir));

  it('renderable', async () => {
    const path = 'test.j2';
    const source = join(hexo.base_dir, defaults.source_dir, defaults.code_dir, path);
    const content = '{{ 1 }}';

    await Promise.all([
      Code.insert({
        _id: `${defaults.source_dir}/${codeDir}/${path}`,
        slug: `${codeDir}/${path}`,
        path: `${codeDir}/${path}`,
        content
      }),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql(`${codeDir}/${path}`);
    data[0].data.modified.should.be.true;

    const result = await data[0].data.data;
    result.should.eql(content);

    await Promise.all([
      Code.removeById(`${defaults.source_dir}/${codeDir}/${path}`),
      unlink(source)
    ]);
  });

  it('not renderable', async () => {
    const path = 'test.txt';
    const source = join(hexo.base_dir, defaults.source_dir, defaults.code_dir, path);
    const content = 'test content';

    await Promise.all([
      Code.insert({
        _id: `${defaults.source_dir}/${codeDir}/${path}`,
        slug: `${codeDir}/${path}`,
        path: `${codeDir}/${path}`,
        content
      }),
      writeFile(source, content)
    ]);
    const data = await generator();
    data[0].path.should.eql(`${codeDir}/${path}`);
    data[0].data.modified.should.be.true;

    const result = await data[0].data.data;
    result.should.eql(content);

    await Promise.all([
      Code.removeById(`${defaults.source_dir}/${codeDir}/${path}`),
      unlink(source)
    ]);
  });

  it('remove codes which does not exist', async () => {
    const path = 'test.js';

    await Code.insert({
      _id: `${defaults.source_dir}/${codeDir}/${path}`,
      slug: `${codeDir}/${path}`,
      path: `${codeDir}/${path}`
    });
    await generator();
    should.not.exist(Code.findById(`${defaults.source_dir}/${codeDir}/${path}`));
  });

  it('don\'t remove extension name', async () => {
    const path = 'test.min.js';
    const source = join(hexo.base_dir, defaults.source_dir, defaults.code_dir, path);

    await Promise.all([
      Code.insert({
        _id: `${defaults.source_dir}/${codeDir}/${path}`,
        slug: `${codeDir}/${path}`,
        path: `${codeDir}/${path}`
      }),
      writeFile(source, '')
    ]);
    const data = await generator();
    data[0].path.should.eql(`${codeDir}/${path}`);

    await Promise.all([
      Code.removeById(`${defaults.source_dir}/${codeDir}/${path}`),
      unlink(source)
    ]);
  });
});
