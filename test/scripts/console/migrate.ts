import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { spy, assert as sinonAssert, stub, SinonSpy } from 'sinon';
import Hexo from '../../../lib/hexo';
import migrateConsole from '../../../lib/plugins/console/migrate';
type OriginalParams = Parameters<typeof migrateConsole>;
type OriginalReturn = ReturnType<typeof migrateConsole>;

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('migrate', () => {
  const hexo = new Hexo(__hexo_dirname, { silent: true });
  const migrate: (...args: OriginalParams) => OriginalReturn = migrateConsole.bind(hexo);

  it('default', async () => {
    const migrator = spy();

    hexo.extend.migrator.register('test', migrator);

    await migrate({ _: ['test'], foo: 1, bar: 2 });

    sinonAssert.calledWithMatch(migrator, { foo: 1, bar: 2 });
    migrator.calledOnce.should.be.true;
  });

  it('no args', async () => {
    const hexo = new Hexo(__hexo_dirname, { silent: true });
    hexo.call = spy();
    const migrate: (...args: OriginalParams) => OriginalReturn = migrateConsole.bind(hexo);

    await migrate({ _: [] });
    (hexo.call as SinonSpy).calledOnce.should.be.true;
    (hexo.call as SinonSpy).args[0][0].should.eql('help');
    (hexo.call as SinonSpy).args[0][1]._[0].should.eql('migrate');
  });

  it('migrator not found', async () => {
    const logStub = stub(console, 'log');

    await migrate({ _: ['foo'] });

    logStub.calledOnce.should.be.true;
    logStub.args[0][0].should.contains('migrator plugin is not installed.');
    logStub.args[0][0].should.contains('Installed migrator plugins:');

    logStub.restore();
  });
});
