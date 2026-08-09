import { join } from 'path';
import { assert as sinonAssert, spy } from 'sinon';
import Hexo from '../../../lib/hexo';
import SourceIdIndex from '../../../lib/plugins/processor/source_id_index';
import chai from 'chai';

chai.should();

describe('SourceIdIndex', () => {
  it('uses the document id for an indexed source', async () => {
    const hexo = new Hexo(join(__dirname, 'source_id_index_test'));
    const Post = hexo.model('Post');
    const doc = await Post.insert({source: '_posts/foo.md', slug: 'foo'});
    const index = new SourceIdIndex(Post);
    const findOne = spy(Post, 'findOne');

    const result = index.find(doc.source);

    result._id.should.eql(doc._id);
    sinonAssert.notCalled(findOne);
    findOne.restore();
  });

  it('recovers if a cached document was replaced externally', async () => {
    const hexo = new Hexo(join(__dirname, 'source_id_index_test'));
    const Post = hexo.model('Post');
    const first = await Post.insert({source: '_posts/foo.md', slug: 'foo'});
    const index = new SourceIdIndex(Post);
    index.find(first.source)._id.should.eql(first._id);

    await first.remove();
    const second = await Post.insert({source: '_posts/foo.md', slug: 'foo'});
    const findOne = spy(Post, 'findOne');

    index.find(second.source)._id.should.eql(second._id);
    index.find(second.source)._id.should.eql(second._id);
    sinonAssert.calledOnce(findOne);
    findOne.restore();
  });
});
