var should = require('chai').should();

describe('is', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var is = require('../../../lib/plugins/helper/is');

  it('is_current', function(){
    is.is_current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    is.is_current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    is.is_current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', function(){
    var paginationDir = hexo.config.pagination_dir;

    is.is_home.call({path: '', config: hexo.config}).should.be.true;
    is.is_home.call({path: paginationDir + '/2/', config: hexo.config}).should.be.true;
  });

  it('is_post', function(){
    var config = {
      permalink: ':id/:category/:year/:month/:day/:title'
    };

    is.is_post.call({path: '123/foo/bar/2013/08/12/foo-bar', config: config}).should.be.true;
  });

  it('is_archive', function(){
    var archiveDir = hexo.config.archive_dir;

    is.is_archive.call({path: archiveDir + '/', config: hexo.config}).should.be.true;
    is.is_archive.call({path: archiveDir + '/2013', config: hexo.config}).should.be.true;
    is.is_archive.call({path: archiveDir + '/2013/08', config: hexo.config}).should.be.true;
  });

  it('is_year', function(){
    is.is_archive.call({path: hexo.config.archive_dir + '/2013', config: hexo.config}).should.be.true;
  });

  it('is_month', function(){
    is.is_archive.call({path: hexo.config.archive_dir + '/2013/08', config: hexo.config}).should.be.true;
  });

  it('is_category', function(){
    is.is_category.call({path: hexo.config.category_dir + '/foo', config: hexo.config}).should.be.true;
  });

  it('is_tag', function(){
    is.is_tag.call({path: hexo.config.tag_dir + '/foo', config: hexo.config}).should.be.true;
  });
});