'use strict';

const rewire = require('rewire');
const sinon = require('sinon');

describe('debug', () => {
  const debug = require('../../../lib/plugins/helper/debug');
  const debugModule = rewire('../../../lib/plugins/helper/debug');
  const { inspect } = require('util');

  it('inspect simple object', () => {
    const obj = { foo: 'bar' };
    debug.inspectObject(obj).should.eql(inspect(obj));
  });

  it('inspect circular object', () => {
    const obj = { foo: 'bar' };
    obj.circular = obj;
    debug.inspectObject(obj).should.eql(inspect(obj));
  });

  it('inspect deep object', () => {
    const obj = { baz: { thud: 'narf', dur: { foo: 'bar', baz: { bang: 'zoom' } } } };
    debug.inspectObject(obj, {depth: 2}).should.not.eql(inspect(obj, {depth: 5}));
    debug.inspectObject(obj, {depth: 5}).should.eql(inspect(obj, {depth: 5}));
  });

  it('log should print to console', () => {
    const spy = sinon.spy();

    debugModule.__with__({
      console: {
        log: spy
      }
    })(() => {
      debugModule.log('Hello %s from debug.log()!', 'World');
    });

    spy.args[0].should.eql(['Hello %s from debug.log()!', 'World']);
  });
});
