var should = require('chai').should();

describe('Helper - is', function(){
  var is = require('../../../lib/plugins/helper/is'),
    config = hexo.config;

  it('is_current', function(){
    is.is_current.call({path: 'foo/bar', config: config}, 'foo').should.be.true;
    is.is_current.call({path: 'foo/bar', config: config}, 'foo/bar').should.be.true;
    is.is_current.call({path: 'foo/bar', config: config}, 'foo/baz').should.be.false;
  });

  it('is_home', function(){
    var paginationDir = config.pagination_dir;

    is.is_home.call({path: '', config: config}).should.be.true;
    is.is_home.call({path: paginationDir + '/2/', config: config}).should.be.true;
  });

  it('is_post', function(){
    var config = {
      permalink: ':id/:category/:year/:month/:day/:title'
    };

    is.is_post.call({path: '123/foo/bar/2013/08/12/foo-bar', config: config}).should.be.true;
  });

  it('is_archive', function(){
    var archiveDir = config.archive_dir;

    is.is_archive.call({path: archiveDir + '/', config: config}).should.be.true;
    is.is_archive.call({path: archiveDir + '/2013', config: config}).should.be.true;
    is.is_archive.call({path: archiveDir + '/2013/08', config: config}).should.be.true;
  });

  it('is_year', function(){
    is.is_archive.call({path: config.archive_dir + '/2013', config: config}).should.be.true;
  });

  it('is_month', function(){
    is.is_archive.call({path: config.archive_dir + '/2013/08', config: config}).should.be.true;
  });

  it('is_category', function(){
    is.is_category.call({path: config.category_dir + '/foo', config: config}).should.be.true;
  });

  it('is_tag', function(){
    is.is_tag.call({path: config.tag_dir + '/foo', config: config}).should.be.true;
  });
});