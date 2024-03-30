// @ts-ignore
import Promise from 'bluebird';
import { Readable } from 'stream';
import { join } from 'path';
import crypto from 'crypto';
import { createReadStream } from 'hexo-fs';
import { spy, assert as sinonAssert } from 'sinon';
import { readStream } from '../../util';
import Router from '../../../lib/hexo/router';
import chai from 'chai';
const should = chai.should();

describe('Router', () => {
  const router = new Router();

  function checkStream(stream, expected) {
    return readStream(stream).then(data => {
      data.should.eql(expected);
    });
  }

  function checksum(stream) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha1');

      stream.on('readable', () => {
        let chunk;

        while ((chunk = stream.read()) !== null) {
          hash.update(chunk);
        }
      }).on('end', () => {
        resolve(hash.digest('hex'));
      }).on('error', reject);
    });
  }

  it('format()', () => {
    router.format('foo').should.eql('foo');

    // Remove prefixed slashes
    router.format('/foo').should.eql('foo');
    router.format('///foo').should.eql('foo');

    // Append `index.html` to the URL with trailing slash
    router.format('foo/').should.eql('foo/index.html');

    // '' => `index.html
    router.format('').should.eql('index.html');
    router.format().should.eql('index.html');

    // Remove backslashes
    router.format('foo\\bar').should.eql('foo/bar');
    router.format('foo\\bar\\').should.eql('foo/bar/index.html');

    // Remove query string
    router.format('foo?a=1&b=2').should.eql('foo');
  });

  it('format() - path must be a string', () => {
    // @ts-ignore
    should.throw(() => router.format(() => {}), 'path must be a string!');
  });

  it('set() - string', () => {
    const listener = spy();

    router.once('update', listener);

    router.set('test', 'foo');
    const data = router.get('test');

    data.modified.should.be.true;
    listener.calledOnce.should.be.true;
    sinonAssert.calledWith(listener, 'test');
    return checkStream(data, 'foo');
  });

  it('set() - function', () => {
    router.set('test', () => 'foo');

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - function (callback style)', () => {
    router.set('test', callback => {
      callback(null, 'foo');
    });

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - readable stream', () => {
    // Prepare a readable stream
    const stream = new Readable();
    stream.push('foo');
    stream.push(null);

    router.set('test', () => stream);

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - modified', () => {
    router.set('test', {
      data: '',
      modified: false
    });

    router.isModified('test').should.be.false;
  });

  it('set() - path must be a string', () => {
    // @ts-ignore
    should.throw(() => router.set(), 'path must be a string!');
  });

  it('set() - data is required', () => {
    // @ts-ignore
    should.throw(() => router.set('test'), 'data is required!');
  });

  it('get() - error handling', () => {
    router.set('test', () => {
      throw new Error('error test');
    });

    return readStream(router.get('test')).then(() => {
      should.fail('Return value must be rejected');
    }, err => {
      err.should.have.property('message', 'error test');
    });
  });

  it('get() - no data', () => {
    router.set('test', () => {

    });

    return checkStream(router.get('test'), '');
  });

  it('get() - empty readable stream', () => {
    const stream = new Readable();
    stream.push(null);

    router.set('test', () => stream);

    return checkStream(router.get('test'), '');
  });

  it('get() - large readable stream (more than 65535 bits)', () => {
    const path = join(__dirname, '../../fixtures/banner.jpg');

    router.set('test', () => createReadStream(path));

    return Promise.all([
      checksum(router.get('test')),
      checksum(createReadStream(path))
    ]).then((data: any) => {
      data[0].should.eql(data[1]);
    });
  });

  it('get() - path must be a string', () => {
    // @ts-ignore
    should.throw(() => router.get(), 'path must be a string!');
  });

  it('get() - export stringified JSON object', () => {
    const obj = {foo: 1, bar: 2};

    router.set('test', () => obj);

    return checkStream(router.get('test'), JSON.stringify(obj));
  });

  it('list()', () => {
    const router = new Router();

    router.set('foo', 'foo');
    router.set('bar', 'bar');
    router.set('baz', 'baz');
    router.remove('bar');

    router.list().should.eql(['foo', 'baz']);
  });

  it('isModified()', () => {
    router.set('test', 'foo');
    router.isModified('test').should.be.true;
  });

  it('isModified() - path must be a string', () => {
    // @ts-ignore
    should.throw(() => router.isModified(), 'path must be a string!');
  });

  it('remove()', () => {
    const listener = spy();

    router.once('remove', listener);

    router.set('test', 'foo');
    router.remove('test');
    should.not.exist(router.get('test'));
    sinonAssert.calledWith(listener, 'test');
    listener.calledOnce.should.be.true;
  });

  it('remove() - path must be a string', () => {
    // @ts-ignore
    should.throw(() => router.remove(), 'path must be a string!');
  });
});
