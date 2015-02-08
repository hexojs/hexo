'use strict';

var should = require('chai').should();
var Promise = require('bluebird');

describe('tagcloud', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');
  var Tag = hexo.model('Tag');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var tagcloud = require('../../../lib/plugins/helper/tagcloud').bind(ctx);

  before(function(){
    return Post.insert([
      {source: 'foo', slug: 'foo'},
      {source: 'bar', slug: 'bar'},
      {source: 'baz', slug: 'baz'},
      {source: 'boo', slug: 'boo'}
    ]).then(function(posts){
      // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
      return Promise.each([
        ['bcd'],
        ['bcd', 'cde'],
        ['bcd', 'cde', 'abc'],
        ['bcd', 'cde', 'abc', 'def']
      ], function(tags, i){
        return posts[i].setTags(tags);
      });
    }).then(function(){
      hexo.locals.invalidate();
      ctx.site = hexo.locals.toObject();
    });
  });

  it('default', function(){
    var result = tagcloud();

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px;">def</a>'
    ].join(''));
  });

  it('specified collection', function(){
    var result = tagcloud(Tag.find({
      name: /bc/
    }));

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 10px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(''));
  });

  it('font size', function(){
    var result = tagcloud({
      min_font: 15,
      max_font: 30
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 20px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 30px;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 25px;">cde</a>',
      '<a href="/tags/def/" style="font-size: 15px;">def</a>'
    ].join(''));
  });

  it('font unit', function(){
    var result = tagcloud({
      unit: 'em'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33em;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20em;">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67em;">cde</a>',
      '<a href="/tags/def/" style="font-size: 10em;">def</a>'
    ].join(''));
  });

  it('orderby', function(){
    var result = tagcloud({
      orderby: 'length'
    });

    result.should.eql([
      '<a href="/tags/def/" style="font-size: 10px;">def</a>',
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(''));
  });

  it('order', function(){
    var result = tagcloud({
      order: -1
    });

    result.should.eql([
      '<a href="/tags/def/" style="font-size: 10px;">def</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">cde</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>',
      '<a href="/tags/abc/" style="font-size: 13.33px;">abc</a>'
    ].join(''));
  });

  it('amount', function(){
    var result = tagcloud({
      amount: 2
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 10px;">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">bcd</a>'
    ].join(''));
  });

  it('transform', function(){
    var result = tagcloud({
      transform: function(name){
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px;">ABC</a>',
      '<a href="/tags/bcd/" style="font-size: 20px;">BCD</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px;">CDE</a>',
      '<a href="/tags/def/" style="font-size: 10px;">DEF</a>'
    ].join(''));
  });

  it('color: name', function(){
    var result = tagcloud({
      color: true,
      start_color: 'red',
      end_color: 'pink'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: #ff4044">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #ffc0cb">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: #ff8087">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: #f00">def</a>'
    ].join(''));
  });

  it('color: hex', function(){
    var result = tagcloud({
      color: true,
      start_color: '#f00', // red
      end_color: '#ffc0cb' // pink
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: #ff4044">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #ffc0cb">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: #ff8087">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: #f00">def</a>'
    ].join(''));
  });

  it('color: RGBA', function(){
    var result = tagcloud({
      color: true,
      start_color: 'rgba(70, 130, 180, 0.3)', // steelblue
      end_color: 'rgb(70, 130, 180)'
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: rgba(70, 130, 180, 0.53)">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #4682b4">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: rgba(70, 130, 180, 0.77)">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: rgba(70, 130, 180, 0.3)">def</a>'
    ].join(''));
  });

  it('color: HSLA', function(){
    var result = tagcloud({
      color: true,
      start_color: 'hsla(207, 44%, 49%, 0.3)', // rgba(70, 130, 180, 0.3)
      end_color: 'hsl(207, 44%, 49%)' // rgb(70, 130, 180)
    });

    result.should.eql([
      '<a href="/tags/abc/" style="font-size: 13.33px; color: rgba(70, 130, 180, 0.53)">abc</a>',
      '<a href="/tags/bcd/" style="font-size: 20px; color: #4682b4">bcd</a>',
      '<a href="/tags/cde/" style="font-size: 16.67px; color: rgba(70, 130, 180, 0.77)">cde</a>',
      '<a href="/tags/def/" style="font-size: 10px; color: rgba(70, 130, 180, 0.3)">def</a>'
    ].join(''));
  });
});