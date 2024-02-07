import r from '../../../lib/plugins/renderer/json';

describe('json', () => {
  it('normal', () => {
    const data = {
      foo: 1,
      bar: {
        baz: 2
      }
    };

    r({text: JSON.stringify(data)}).should.eql(data);
  });
});
