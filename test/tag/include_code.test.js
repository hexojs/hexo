var cheerio = require('cheerio'),
  path = require('path'),
  should = require('chai').should(),
  file = require('../../lib/util/file2'),
  highlight = require('../../lib/util/highlight');

describe('include_code', function(){
  var include_code = require('../../lib/plugins/tag/include_code'),
    content = '';

  before(function(done){
    file.readFile(path.join(hexo.source_dir, 'downloads', 'code', 'test.js'), function(err, result){
      if (err) throw err;

      result = result.replace(/\n$/, '');
      content = cheerio.load(highlight(result))('table').html();
      done();
    });
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