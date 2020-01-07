'use strict';

describe('Injector', () => {
  const Injector = require('../../../lib/extend/injector');

  it('register() - entry is required', () => {
    const i = new Injector();

    // no name
    try {
      i.register();
    } catch (err) {
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'entry is required');
    }
  });

  it('register() - string', () => {
    const i = new Injector();

    const str = '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('head_begin', str);
    i.register('head_end', str, 'home');

    i.get('head_begin').should.contains(str);
    i.get('head_begin', 'default').should.contains(str);
    i.get('head_end', 'home').should.contains(str);
  });

  it('register() - function', () => {
    const i = new Injector();

    const fn = () => '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('head_begin', fn);

    i.get('head_begin').should.contains(fn());
  });

  it('register() - fallback when entry not exists', () => {
    const i = new Injector();

    const str = '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('foo', str);

    i.get('head_end').should.contains(str);
  });

  it('list()', () => {
    const i = new Injector();

    i.register('body_begin', '<script src="DPlayer.min.js"></script>');

    i.list().body_begin.default.should.be.instanceOf(Set);
    [...i.list().body_begin.default].should.not.be.empty;
  });

  it('get()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('body_begin', str);
    i.register('body_end', str, 'home');

    i.get('body_begin').should.be.instanceOf(Array);
    i.get('body_begin').should.contains(str);
    i.get('body_end', 'home').should.be.instanceOf(Array);
    i.get('body_end', 'home').should.contains(str);

    i.get('head_end').should.be.instanceOf(Array);
    i.get('head_end').should.eql([]);
  });

  it('getText()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('head_end', str);
    i.register('body_end', str, 'home');

    i.getText('body_end', 'home').should.eql(str);
    i.getText('body_end').should.eql('');
  });
});
