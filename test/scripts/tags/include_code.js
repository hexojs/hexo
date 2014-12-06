var cheerio = require('cheerio');
var path = require('path');
var should = require('chai').should();
var fs = require('../../../lib/util/fs');
var highlight = require('../../../lib/util/highlight');

// Fixture
function unique(arr){
  var a = [],
    l = arr.length;

  for (var i = 0; i < l; i++){
    for (var j = i + 1; j < l; j++){
      if (arr[i] === arr[j]) j = ++i;
    }

    a.push(arr[i]);
  }

  return a;
}

describe.skip('include_code', function(){
  var include_code = require('../../../lib/plugins/tag/include_code'),
    raw = unique.toString(),
    content = cheerio.load(highlight(raw))('table').html();

  before(function(done){
    file.writeFile(path.join(hexo.source_dir, 'downloads', 'code', 'test.js'), raw, done);
  });

  it('file', function(){
    var $ = cheerio.load(include_code('test.js'.split(' ')));

    $('figure').attr('class').should.eql('highlight js');
    $('figure table').html().should.eql(content);
  });

  it('title', function(){
    var $ = cheerio.load(include_code('Code block title test.js'.split(' ')));

    $('figcaption span').html().should.eql('Code block title');
  });

  it('lang', function(){
    var $ = cheerio.load(include_code('lang:javascript test.js'.split(' ')));

    $('figure').attr('class').should.eql('highlight javascript');
  });
});