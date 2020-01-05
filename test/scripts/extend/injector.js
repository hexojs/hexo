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

    i.get('head_begin')[0].value.should.contains(str);
  });

  it('register() - function', () => {
    const i = new Injector();

    const fn = () => '<link rel="stylesheet" href="DPlayer.min.css" />';
    i.register('head_begin', fn);

    i.get('head_begin')[0].value.should.contains(fn());
  });

  it('list()', () => {
    const i = new Injector();

    i.register('body_begin', '<script src="DPlayer.min.js"></script>');

    i.list().body_begin.should.be.instanceOf(Set);
    [...i.list().body_begin].should.not.be.empty;
  });

  it('get()', () => {
    const i = new Injector();
    const str = '<script src="jquery.min.js"></script>';

    i.register('body_end', str);

    i.get('body_end').should.be.instanceOf(Array);
    i.get('body_end')[0].value.should.contains(str);
  });
});
