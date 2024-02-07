import r from '../../../dist/plugins/renderer/plain';

describe('plain', () => {
  it('normal', () => {
    r({text: '123'}).should.eql('123');
  });
});
