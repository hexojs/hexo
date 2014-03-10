var should = require('chai').should();

describe('i18n', function(){
  var I18n = require('../../lib/core/i18n'),
    i18n = new I18n({code: 'zh-TW'});

  ['default', 'zh-TW'].forEach(function(name){
    i18n.set(name, require('./' + name + '.json'));
  });

  it('constructor', function(){
    i18n.options.code.should.eql(['zh-TW', 'zh']);
  });

  it('__', function(){
    var __ = i18n.__();

    __.languages.should.eql(['zh-TW', 'zh', 'default']);

    __('index').should.eql('index');
    __('index.title').should.eql('首頁');
    __('index.add').should.eql('新增');

    __ = i18n.__('default');

    __.languages.should.eql(['default', 'zh-TW', 'zh']);

    __('index.title').should.eql('Home');
    __('index.add').should.eql('Add');
  });

  it('_p', function(){
    var _p = i18n._p();

    _p.languages.should.eql(['zh-TW', 'zh', 'default']);

    _p('index', 0).should.eql('index');
    _p('index.video', 0).should.eql('沒有影片');
    _p('index.video', 1).should.eql('1 部影片');
    _p('index.video', 10).should.eql('10 部影片');

    _p = i18n._p('default');

    _p.languages.should.eql(['default', 'zh-TW', 'zh']);

    _p('index.video', 0).should.eql('No videos');
    _p('index.video', 1).should.eql('One video');
    _p('index.video', 10).should.eql('10 videos');
  });
});