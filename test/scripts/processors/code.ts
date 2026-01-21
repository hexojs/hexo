import { join } from 'path';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import defaults from '../../../lib/hexo/default_config';
import codes from '../../../lib/plugins/processor/code';
import chai from 'chai';
import BluebirdPromise from 'bluebird';
const should = chai.should();

describe('code', () => {
  const baseDir = join(__dirname, 'code_test');
  const hexo = new Hexo(baseDir);
  const code = codes(hexo);
  const process = BluebirdPromise.method(code.process).bind(hexo);
  const { pattern } = code;
  const { source } = hexo;
  const { File } = source;
  const Code = hexo.model('Code');
  const codeDir = defaults.code_dir;

  function newFile(options) {
    const path = options.path;

    options.params = {
      path
    };

    options.path = `${codeDir}/${path}`;
    options.source = join(source.base, options.path);

    return new File(options);
  }

  before(async () => {
    await mkdirs(baseDir);
    await hexo.init();
  });

  beforeEach(() => { hexo.config = Object.assign({}, defaults); });

  after(() => rmdir(baseDir));

  it('pattern', () => {
    pattern.match(`${codeDir}/users.json`).should.eql(true);
    pattern.match(`${codeDir}/users.j2`).should.eql(true);
    pattern.match(`${codeDir}/users.html`).should.eql(true);
    pattern.match('users.json').should.eql(false);
  });

  it('type: create - renderable', async () => {
    const body = '{{ 1 }}';

    const file = newFile({
      path: 'users.j2',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const data = Code.findOne({ slug: `${codeDir}/users.j2` });

    data.content.should.eql('{{ 1 }}');

    data.remove();
    unlink(file.source);
  });

  it('type: create - non-renderable', async () => {
    const body = '{a: 1}';

    const file = newFile({
      path: 'users.txt',
      type: 'create'
    });

    await writeFile(file.source, body);
    await process(file);
    const data = Code.findOne({ slug: `${codeDir}/users.txt` });

    data.content.should.eql('{a: 1}');

    data.remove();
    unlink(file.source);
  });

  it('type: update', async () => {
    const body = '{{ 1 }}';

    const file = newFile({
      path: 'users.j2',
      type: 'update'
    });

    await BluebirdPromise.all([
      writeFile(file.source, body),
      Code.insert({
        _id: `${defaults.source_dir}/${codeDir}/users.j2`,
        slug: `${codeDir}/users.j2`,
        path: `${codeDir}/users.j2`,
        content: ''
      })
    ]);
    await process(file);
    const data = Code.findOne({ slug: `${codeDir}/users.j2` });

    data.content.should.eql('{{ 1 }}');

    data.remove();
    unlink(file.source);
  });

  it('type: skip', async () => {
    const file = newFile({
      path: 'users.j2',
      type: 'skip'
    });

    await Code.insert({
      _id: `${defaults.source_dir}/${codeDir}/users.j2`,
      slug: `${codeDir}/users.j2`,
      path: `${codeDir}/users.j2`,
      content: '{{ 1 }}'
    });
    const data = Code.findOne({ slug: `${codeDir}/users.j2` });
    await process(file);
    should.exist(data);
    data.remove();
  });

  it('type: delete', async () => {
    const file = newFile({
      path: 'users.j2',
      type: 'delete'
    });

    await Code.insert({
      _id: `${defaults.source_dir}/${codeDir}/users.j2`,
      slug: `${codeDir}/users.j2`,
      path: `${codeDir}/users.j2`,
      content: '{{ 1 }}'
    });
    await process(file);
    should.not.exist(Code.findOne({ slug: `${codeDir}/users.j2` }));
  });

  it('type: delete - not exist', async () => {
    const file = newFile({
      path: 'users.j2',
      type: 'delete'
    });

    await process(file);
    should.not.exist(Code.findOne({ slug: `${codeDir}/users.j2` }));
  });
});
