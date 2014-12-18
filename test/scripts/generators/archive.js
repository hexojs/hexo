var should = require('chai').should();
var Promise = require('bluebird');

describe('archive', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var generator = Promise.method(require('../../../lib/plugins/generator/archive').bind(hexo));
  var posts;

  function checkPosts(locals, arr){
    locals.length.should.eql(arr.length);

    for (var i = 0, len = arr.length; i < len; i++){
      locals.eq(i)._id.should.eql(posts[arr[i]]._id);
    }
  }

  function testNoPagination(){
    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['archive', 'index']);
      locals.archive.should.be.true;

      switch (path){
        case 'archives/':
          should.not.exist(locals.year);
          should.not.exist(locals.month);
          checkPosts(locals.posts, [0, 2, 3, 1]);
          break;

        case 'archives/2013/':
          locals.year.should.eql(2013);
          should.not.exist(locals.month);
          checkPosts(locals.posts, [2, 3, 1]);
          break;

        case 'archives/2013/06/':
          locals.year.should.eql(2013);
          locals.month.should.eql(6);
          checkPosts(locals.posts, [3, 1]);
          break;

        case 'archives/2013/10/':
          locals.year.should.eql(2013);
          locals.month.should.eql(10);
          checkPosts(locals.posts, [2]);
          break;

        case 'archives/2014/':
          locals.year.should.eql(2014);
          should.not.exist(locals.month);
          checkPosts(locals.posts, [0]);
          break;

        case 'archives/2014/02/':
          locals.year.should.eql(2014);
          locals.month.should.eql(2);
          checkPosts(locals.posts, [0]);
          break;

        default:
          throw new Error('Path "' + path + '" is not expected!');
      }
    });
  }

  before(function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', date: new Date(2014, 1, 2)},
      {source: 'bar', slug: 'bar', date: new Date(2013, 5, 6)},
      {source: 'baz', slug: 'baz', date: new Date(2013, 9, 10)},
      {source: 'boo', slug: 'boo', date: new Date(2013, 5, 8)}
    ]).then(function(data){
      posts = data;
    });
  });

  it('mode: 0', function(){
    hexo.config.archive = 0;

    return generator(hexo.locals).then(function(){
      should.not.exist(hexo.route.get('archives/'));
    });
  });

  it('mode: 1', function(){
    hexo.config.archive = 1;

    return testNoPagination();
  });

  it('mode: 2 (per_page > 0)', function(){
    hexo.config.archive = 2;
    hexo.config.per_page = 2;

    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['archive', 'index']);
      locals.archive.should.be.true;
      locals.current_url.should.eql(path);

      switch (path){
        case 'archives/':
          locals.base.should.eql('/archives/');
          locals.total.should.eql(2);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(2);
          locals.next_link.should.eql('archives/page/2/');
          checkPosts(locals.posts, [0, 2]);
          break;

        case 'archives/page/2/':
          locals.base.should.eql('/archives/');
          locals.total.should.eql(2);
          locals.current.should.eql(2);
          locals.prev.should.eql(1);
          locals.prev_link.should.eql('archives/');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [3, 1]);
          break;

        case 'archives/2013/':
          locals.base.should.eql('/archives/2013/');
          locals.total.should.eql(2);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(2);
          locals.next_link.should.eql('archives/2013/page/2/');
          checkPosts(locals.posts, [2, 3]);
          break;

        case 'archives/2013/page/2/':
          locals.base.should.eql('/archives/2013/');
          locals.total.should.eql(2);
          locals.current.should.eql(2);
          locals.prev.should.eql(1);
          locals.prev_link.should.eql('archives/2013/');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [1]);
          break;

        case 'archives/2013/06/':
          locals.base.should.eql('/archives/2013/06/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [3, 1]);
          break;

        case 'archives/2013/10/':
          locals.base.should.eql('/archives/2013/10/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [2]);
          break;

        case 'archives/2014/':
          locals.base.should.eql('/archives/2014/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [0]);
          break;

        case 'archives/2014/02/':
          locals.base.should.eql('/archives/2014/02/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          checkPosts(locals.posts, [0]);
          break;

        default:
          throw new Error('Path "' + path + '" is not expected!');
      }
    });
  });

  it('mode: 2 (per_page = 0)', function(){
    hexo.config.archive = 2;
    hexo.config.per_page = 0;

    return testNoPagination();
  });
});