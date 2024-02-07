import { join } from 'path';
import Hexo from '../../../lib/hexo';

describe('Asset', () => {
  const hexo = new Hexo();
  const Asset = hexo.model('Asset');

  it('default values', async () => {
    const data = await Asset.insert({
      _id: 'foo',
      path: 'bar'
    });
    data.modified.should.be.true;

    Asset.removeById(data._id);
  });

  it('_id - required', async () => {
    try {
      await Asset.insert({});
    } catch (err) {
      err.message.should.eql('ID is not defined');
    }
  });

  it('path - required', async () => {
    try {
      await Asset.insert({
        _id: 'foo'
      });
    } catch (err) {
      err.message.should.eql('`path` is required!');
    }
  });

  it('source - virtual', async () => {
    const data = await Asset.insert({
      _id: 'foo',
      path: 'bar'
    });
    data.source.should.eql(join(hexo.base_dir, data._id));

    Asset.removeById(data._id);
  });
});
