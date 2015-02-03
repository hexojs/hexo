'use strict';

var should = require('chai').should();

describe('is', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var is = require('../../../lib/plugins/helper/is');

  it('is_current', function(){
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/bar').should.be.true;
    is.current.call({path: 'foo/bar', config: hexo.config}, 'foo/baz').should.be.false;
  });

  it('is_home', function(){
    var paginationDir = hexo.config.pagination_dir;

    is.home.call({path: '', config: hexo.config, page: {}}).should.be.true;
    is.home.call({path: paginationDir + '/2/', config: hexo.config, page: {}}).should.be.true;
    is.home.call({path: 'index.html', config: hexo.config, page: {}}).should.be.true;
    is.home.call({path: paginationDir + '/2/index.html', config: hexo.config, page: {}}).should.be.true;

    is.home.call({
      path: 'zh-tw/index.html',
      config: hexo.config,
      page: {canonical_path: 'index.html'}
    }).should.be.true;
  });

  it('is_post', function(){
    var config = {
      permalink: ':id/:category/:year/:month/:day/:title'
    };

    is.post.call({path: '123/foo/bar/2013/08/12/foo-bar', config: config}).should.be.true;
  });

  it('is_archive', function(){
    is.archive.call({}).should.be.false;
    is.archive.call({archive: true}).should.be.true;
    is.archive.call({archive: false}).should.be.false;
  });

  it('is_year', function(){
    is.year.call({}).should.be.false;
    is.year.call({archive: true}).should.be.false;
    is.year.call({archive: true, year: 2014}).should.be.true;
    is.year.call({archive: true, year: 2014}, 2014).should.be.true;
    is.year.call({archive: true, year: 2014}, 2015).should.be.false;
    is.year.call({archive: true, year: 2014, month: 10}).should.be.true;
  });

  it('is_month', function(){
    is.month.call({}).should.be.false;
    is.month.call({archive: true}).should.be.false;
    is.month.call({archive: true, year: 2014}).should.be.false;
    is.month.call({archive: true, year: 2014, month: 10}).should.be.true;
    is.month.call({archive: true, year: 2014, month: 10}, 2014, 10).should.be.true;
    is.month.call({archive: true, year: 2014, month: 10}, 2015, 10).should.be.false;
    is.month.call({archive: true, year: 2014, month: 10}, 2014, 12).should.be.false;
    is.month.call({archive: true, year: 2014, month: 10}, 10).should.be.true;
    is.month.call({archive: true, year: 2014, month: 10}, 12).should.be.false;
  });

  it('is_category', function(){
    is.category.call({category: 'foo'}).should.be.true;
    is.category.call({}).should.be.false;
  });

  it('is_tag', function(){
    is.tag.call({tag: 'foo'}).should.be.true;
    is.tag.call({}).should.be.false;
  });
});