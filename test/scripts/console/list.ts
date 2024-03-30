import { spy, stub, assert as sinonAssert, SinonSpy } from 'sinon';
// @ts-ignore
import Promise from 'bluebird';
import Hexo from '../../../lib/hexo';
import listConsole from '../../../lib/plugins/console/list';
type OriginalParams = Parameters<typeof listConsole>;
type OriginalReturn = ReturnType<typeof listConsole>;

describe('Console list', () => {
  const hexo = new Hexo(__dirname);

  it('no args', () => {
    hexo.call = spy();

    const list: (...args: OriginalParams) => OriginalReturn = listConsole.bind(hexo);

    list({ _: [''] });

    (hexo.call as SinonSpy).calledOnce.should.be.true;
    (hexo.call as SinonSpy).args[0][0].should.eql('help');
    (hexo.call as SinonSpy).args[0][1]._[0].should.eql('list');
  });

  it('has args', async () => {
    const logStub = stub(console, 'log');

    hexo.load = () => Promise.resolve();

    const list: (...args: OriginalParams) => OriginalReturn = listConsole.bind(hexo);

    await list({ _: ['page'] });

    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'No pages.');
    logStub.restore();
  });

  it('list type not found', () => {
    hexo.call = spy();

    const list: (...args: OriginalParams) => OriginalReturn = listConsole.bind(hexo);

    list({ _: ['test'] });

    (hexo.call as SinonSpy).calledOnce.should.be.true;
    (hexo.call as SinonSpy).args[0][0].should.eql('help');
    (hexo.call as SinonSpy).args[0][1]._[0].should.eql('list');
  });
});
