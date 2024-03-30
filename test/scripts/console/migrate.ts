import { spy, assert as sinonAssert, stub, SinonSpy } from 'sinon';
import Hexo from '../../../lib/hexo';
import migrateConsole from '../../../lib/plugins/console/migrate';
type OriginalParams = Parameters<typeof migrateConsole>;
type OriginalReturn = ReturnType<typeof migrateConsole>;

describe('migrate', () => {
  const hexo = new Hexo(__dirname, { silent: true });
  const migrate: (...args: OriginalParams) => OriginalReturn = migrateConsole.bind(hexo);

  it('default', async () => {
    const migrator = spy();

    hexo.extend.migrator.register('test', migrator);

    await migrate({ _: ['test'], foo: 1, bar: 2 });

    sinonAssert.calledWithMatch(migrator, { foo: 1, bar: 2 });
    migrator.calledOnce.should.be.true;
  });

  it('no args', async () => {
    const hexo = new Hexo(__dirname, { silent: true });
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
