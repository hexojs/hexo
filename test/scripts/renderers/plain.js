const should = require('chai').should(); // eslint-disable-line

describe('plain', () => {
  const r = require('../../../lib/plugins/renderer/plain');

  it('normal', () => {
    r({text: '123'}).should.eql('123');
  });
});
