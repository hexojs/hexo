'use strict';

var should = require('chai').should(); // eslint-disable-line
//var Promise = require('bluebird');
var pathFn = require('path');
var fs = require('hexo-fs');

describe('inject', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'inject_test'));
  var inject = require('../../../lib/plugins/tag/inject')(hexo);
  var filePath = pathFn.join(hexo.source_dir, 'test_dir/test.html');
  var emptyPath = pathFn.join(hexo.source_dir, 'test_dir/empty.html');

  var fixture = [
    '<h1>go to sleep ya little bae</h1>',
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  // returns the content of the file
  function content(args) {
    return inject([args]);
  }

  before(function() {
    // create files for testing
    fs.writeFileSync(filePath, fixture);
    fs.writeFileSync(emptyPath, '');

    return;
  });

  after(function() {
    // remove the testing arena
    return fs.rmdir(hexo.base_dir);
  });

  it('existing file', function() {
    return content('test_dir/test.html').then(function(result) {
      result.should.eql(fixture);
    });
  });

  it('empty file', function() {

    return content('test_dir/empty.html').then(function(result) {
      should.not.exist(result);
    });
  });

  it('nonexistent file', function() {
    return content('this/file/doesnt/exist.magic').then(function(result) {
      should.not.exist(result);
    });
  });
});
