import { join } from 'path';
import Hexo from '../../../lib/hexo';

describe('Code', () => {
  const hexo = new Hexo();
  const Code = hexo.model('Code');

  it('_id - required', async () => {
    try {
      await Code.insert({});
    } catch (err) {
      err.message.should.eql('ID is not defined');
    }
  });

  it('path - required', async () => {
    try {
      await Code.insert({
        _id: 'foo'
      });
    } catch (err) {
      err.message.should.eql('`path` is required!');
    }
  });

  it('slug - required', async () => {
    try {
      await Code.insert({
        _id: 'foo',
        path: 'bar'
      });
    } catch (err) {
      err.message.should.eql('`slug` is required!');
    }
  });

  it('default values', async () => {
    const data = await Code.insert({
      _id: 'foo',
      path: 'bar',
      slug: 'baz'
    });
    data.modified.should.be.true;
    data.content.should.eql('');

    Code.removeById(data._id);
  });

  it('source - virtual', async () => {
    const data = await Code.insert({
      _id: 'foo',
      path: 'bar',
      slug: 'baz'
    });
    data.source.should.eql(join(hexo.base_dir, data._id));

    Code.removeById(data._id);
  });
});
