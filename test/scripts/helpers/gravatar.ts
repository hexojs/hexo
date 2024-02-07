import crypto from 'crypto';
import gravatarHelper from '../../../lib/plugins/helper/gravatar';

describe('gravatar', () => {
  function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  const gravatar = gravatarHelper as any;

  const email = 'abc@abc.com';
  const hash = md5(email);

  it('default', () => {
    gravatar(email).should.eql('https://www.gravatar.com/avatar/' + hash);
  });

  it('size', () => {
    gravatar(email, 100).should.eql('https://www.gravatar.com/avatar/' + hash + '?s=100');
  });

  it('options', () => {
    gravatar(email, {
      s: 200,
      r: 'pg',
      d: 'mm'
    }).should.eql('https://www.gravatar.com/avatar/' + hash + '?s=200&r=pg&d=mm');
  });
});
