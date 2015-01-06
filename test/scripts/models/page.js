var should = require('chai').should();
var pathFn = require('path');

describe('Page', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Page = hexo.model('Page');

  it('default values', function(){
    var now = Date.now();

    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(data){
      data.title.should.eql('');
      data.date.valueOf().should.gte(now);
      data.updated.valueOf().should.gte(now);
      data.comments.should.be.true;
      data.layout.should.eql('page');
      data._content.should.eql('');
      data.raw.should.eql('');

      return Page.removeById(data._id);
    });
  });

  it('source - required', function(){
    return Page.insert({}).catch(function(err){
      err.should.have.property('message', '`source` is required!');
    });
  });

  it('path - required', function(){
    return Page.insert({
      source: 'foo'
    }).catch(function(err){
      err.should.have.property('message', '`path` is required!');
    });
  });

  it('permalink - virtual', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(data){
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      return Page.removeById(data._id);
    });
  });

  it('full_source - virtual', function(){
    return Page.insert({
      source: 'foo',
      path: 'bar'
    }).then(function(data){
      data.full_source.should.eql(pathFn.join(hexo.source_dir, data.source));
      return Page.removeById(data._id);
    });
  });

  it('content - virtual', function(){
    var content = [
      '{% raw %}',
      '123456',
      '{% endraw %}'
    ].join('\n');

    return Page.insert({
      source: 'foo',
      path: 'bar',
      _content: content
    }).then(function(data){
      data.content.should.eql('123456');
      return Page.removeById(data._id);
    });
  });

  it('excerpt / more - virtual (with more tag)', function(){
    var content = [
      '123456',
      '<a id="more"></a>',
      '789012'
    ].join('\n');

    return Page.insert({
      source: 'foo',
      path: 'bar',
      _content: content
    }).then(function(data){
      data.excerpt.should.eql('123456');
      data.more.should.eql('789012');
      return Page.removeById(data._id);
    });
  });

  it('excerpt / more - virtual (without more tag)', function(){
    var content = '123456';

    return Page.insert({
      source: 'foo',
      path: 'bar',
      _content: content
    }).then(function(data){
      data.excerpt.should.eql('');
      data.more.should.eql('123456');
      return Page.removeById(data._id);
    });
  });
});