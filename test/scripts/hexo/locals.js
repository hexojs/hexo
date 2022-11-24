'use strict';

describe('Locals', () => {
  const Locals = require('../../../dist/hexo/locals');
  const locals = new Locals();

  it('get() - name must be a string', () => {
    should.throw(() => locals.get(), 'name must be a string!');
  });

  it('set() - function', () => {
    locals.set('foo', () => 'foo');

    // cache should be clear after new data is set
    locals.cache.has('foo').should.be.false;
    locals.get('foo').should.eql('foo');
    // cache should be saved once it's get
    locals.cache.get('foo').should.eql('foo');
  });

  it('set() - not function', () => {
    locals.set('foo', 'foo');
    locals.get('foo').should.eql('foo');
  });

  it('set() - name must be a string', () => {
    should.throw(() => locals.set(), 'name must be a string!');
  });

  it('set() - value is required', () => {
    should.throw(() => locals.set('test'), 'value is required!');
  });

  it('remove()', () => {
    locals.set('foo', 'foo');
    locals.get('foo');
    locals.remove('foo');

    should.not.exist(locals.getters.foo);
    locals.cache.has('foo').should.be.false;
  });

  it('remove() - name must be a string', () => {
    should.throw(() => locals.remove(), 'name must be a string!');
  });

  it('toObject()', () => {
    const locals = new Locals();

    locals.set('foo', 'foo');
    locals.set('bar', 'bar');
    locals.remove('bar');
    locals.toObject().should.eql({foo: 'foo'});
  });

  it('invalidate()', () => {
    locals.set('foo', 'foo');
    locals.get('foo');
    locals.invalidate();

    locals.cache.has('foo').should.be.false;
  });
});
