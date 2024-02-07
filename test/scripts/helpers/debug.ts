import { stub } from 'sinon';
import { inspectObject, log } from '../../../lib/plugins/helper/debug';
import { inspect } from 'util';

describe('debug', () => {
  it('inspect simple object', () => {
    const obj = { foo: 'bar' };
    inspectObject(obj).should.eql(inspect(obj));
  });

  it('inspect circular object', () => {
    const obj: any = { foo: 'bar' };
    obj.circular = obj;
    inspectObject(obj).should.eql(inspect(obj));
  });

  it('inspect deep object', () => {
    const obj = { baz: { thud: 'narf', dur: { foo: 'bar', baz: { bang: 'zoom' } } } };
    inspectObject(obj, {depth: 2}).should.not.eql(inspect(obj, {depth: 5}));
    inspectObject(obj, {depth: 5}).should.eql(inspect(obj, {depth: 5}));
  });

  it('log should print to console', () => {
    const logStub = stub(console, 'log');

    try {
      log('Hello %s from debug.log()!', 'World');
    } finally {
      logStub.restore();
    }

    logStub.calledWithExactly('Hello %s from debug.log()!', 'World').should.be.true;
  });
});
