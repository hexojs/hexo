import Hexo from '../../../lib/hexo';

describe('Cache', () => {
  const hexo = new Hexo();
  const Cache = hexo.model('Cache');

  it('_id - required', async () => {
    try {
      await Cache.insert({});
    } catch (err) {
      err.message.should.eql('ID is not defined');
    }
  });
});
