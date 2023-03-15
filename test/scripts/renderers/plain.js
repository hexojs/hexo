'use strict';

describe('plain', () => {
  const r = require('../../../dist/plugins/renderer/plain');

  it('normal', () => {
    r({text: '123'}).should.eql('123');
  });
});
