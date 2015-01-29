'use strict';

var should = require('chai').should();
var _ = require('lodash');

describe('toc', function(){
  var toc = require('../../../lib/plugins/helper/toc');

  var html = [
    '<h1 id="title_1">Title 1</h1>',
    '<h2 id="title_1_1">Title 1.1</h2>',
    '<h3 id="title_1_1_1">Title 1.1.1</h3>',
    '<h2 id="title_1_2">Title 1.2</h2>',
    '<h2 id="title_1_3">Title 1.3</h2>',
    '<h3 id="title_1_3_1">Title 1.3.1</h3>',
    '<h1 id="title_2">Title 2</h1>',
    '<h2 id="title_2_1">Title 2.1</h2>'
  ].join('');

  var genResult = function(options){
    options = _.extend({
      class: 'toc',
      list_number: true
    }, options);

    var className = options.class,
      listNumber = options.list_number;

    var result = [
      '<ol class="' + className + '">',
        '<li class="' + className + '-item ' + className + '-level-1">',
          '<a class="' + className + '-link" href="#title_1">',
            (listNumber ? '<span class="' + className + '-number">1.</span> ' : ''),
            '<span class="' + className + '-text">Title 1</span>',
          '</a>',
          '<ol class="' + className + '-child">',
            '<li class="' + className + '-item ' + className + '-level-2">',
              '<a class="' + className + '-link" href="#title_1_1">',
                (listNumber ? '<span class="' + className + '-number">1.1.</span> ' : ''),
                '<span class="' + className + '-text">Title 1.1</span>',
              '</a>',
              '<ol class="' + className + '-child">',
                '<li class="' + className + '-item ' + className + '-level-3">',
                  '<a class="' + className + '-link" href="#title_1_1_1">',
                    (listNumber ? '<span class="' + className + '-number">1.1.1.</span> ' : ''),
                    '<span class="' + className + '-text">Title 1.1.1</span>',
                  '</a>',
                '</li>',
              '</ol>',
            '</li>',
            '<li class="' + className + '-item ' + className + '-level-2">',
              '<a class="' + className + '-link" href="#title_1_2">',
                (listNumber ? '<span class="' + className + '-number">1.2.</span> ' : ''),
                '<span class="' + className + '-text">Title 1.2</span>',
              '</a>',
            '</li>',
            '<li class="' + className + '-item ' + className + '-level-2">',
              '<a class="' + className + '-link" href="#title_1_3">',
                (listNumber ? '<span class="' + className + '-number">1.3.</span> ' : ''),
                '<span class="' + className + '-text">Title 1.3</span>',
              '</a>',
              '<ol class="' + className + '-child">',
                '<li class="' + className + '-item ' + className + '-level-3">',
                  '<a class="' + className + '-link" href="#title_1_3_1">',
                    (listNumber ? '<span class="' + className + '-number">1.3.1.</span> ' : ''),
                    '<span class="' + className + '-text">Title 1.3.1</span>',
                  '</a>',
                '</li>',
              '</ol>',
            '</li>',
          '</ol>',
        '</li>',
        '<li class="' + className + '-item ' + className + '-level-1">',
          '<a class="' + className + '-link" href="#title_2">',
            (listNumber ? '<span class="' + className + '-number">2.</span> ' : ''),
            '<span class="' + className + '-text">Title 2</span>',
          '</a>',
          '<ol class="' + className + '-child">',
            '<li class="' + className + '-item ' + className + '-level-2">',
              '<a class="' + className + '-link" href="#title_2_1">',
                (listNumber ? '<span class="' + className + '-number">2.1.</span> ' : ''),
                '<span class="' + className + '-text">Title 2.1</span>',
              '</a>',
            '</li>',
          '</ol>',
        '</li>',
      '</ol>'
    ].join('');

    return result;
  };

  it('default', function(){
    genResult().should.eql(toc(html));
  });

  it('class', function(){
    var options = {
      class: 'foo'
    };

    genResult(options).should.eql(toc(html, options));
  });

  it('list_number', function(){
    var options = {
      list_number: false
    };

    genResult(options).should.eql(toc(html, options));
  });
});