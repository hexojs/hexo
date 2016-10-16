'use strict';

var pathFn = require('path');
var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var yml = require('js-yaml');

describe('config flag handling', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'test_dir'), {
      silent: true,
      debug: true
    });

  var mcp = require('../../../lib/hexo/multi_config_path')(hexo);
  var base = hexo.base_dir;

  var debugPath = pathFn.resolve('debug.log');

  function readDebug() {
    return fs.readFile(debugPath).then(function(out) {
      var lines = out.split('\n');

      var debug = [];
      for (var i = 0; i < lines.length; i++) {
        debug.push(yml.safeLoad(lines[i]), {'json': true});
      }

      return debug;
    });
  }

  var testYaml1 = [
    'author: foo',
    'type: dinosaur',
    'favorites:',
    '  food: sushi',
    '  color: purple'
  ].join('\n');

  var testYaml2 = [
    'author: bar',
    'favorites:',
    '  food: candy',
    '  ice_cream: chocolate'
  ].join('\n');

  var testJson1 = [
    '{',
    '"author": "dinosaur",',
    '"type": "elephant",',
    '"favorites": {"food": "burgers"}',
    '}'
  ].join('\n');

  var testJson2 = [
    '{',
    '"author": "waldo",',
    '"favorites": {',
    '  "food": "ice cream",',
    '  "ice_cream": "strawberry"',
    '  }',
    '}'
  ].join('\n');

  before(function() {
    if (fs.existsSync(debugPath)) fs.unlinkSync(debugPath);

    fs.writeFileSync(base + 'test1.yml', testYaml1);
    fs.writeFileSync(base + 'test2.yml', testYaml2);
    fs.writeFileSync(base + 'test1.json', testJson1);
    fs.writeFileSync(base + 'test2.json', testJson2);
    return;
  });

  afterEach(function() {
    if (fs.existsSync(debugPath)) fs.unlinkSync(debugPath);
    return;
  });

  after(function() {
    return fs.rmdir(hexo.base_dir);
  });

  it('no file', function() {
    mcp(base).should.equal(base + '_config.yml');
    readDebug().then(function(debug) {
      debug[0].level.should.eql(40);
      debug[0].msg.should.eql('No config file entered.');
    });
  });

  it('1 file', function() {
    mcp(base, 'test1.yml').should.eql(
            pathFn.resolve(base + 'test1.yml'));

    mcp(base, 'test1.json').should.eql(
            pathFn.resolve(base + 'test1.json'));
  });

  it('1 not found file warning', function() {
    var notFile = 'not_a_file.json';

    mcp(base, notFile).should.eql(pathFn.join(base, '_config.yml'));
    readDebug().then(function(debug) {
      debug[0].level.should.eql(40);
      debug[0].msg.should.eql('Config file ' + notFile +
                              ' not found, using default.');
    });
  });

  it('combined config output', function() {
    var combinedPath = pathFn.join(base, '_multiconfig.yml');

    mcp(base, 'test1.yml').should.not.eql(combinedPath);
    mcp(base, 'test1.yml,test2.yml').should.eql(combinedPath);
    mcp(base, 'test1.yml,test1.json').should.eql(combinedPath);
    mcp(base, 'test1.json,test2.json').should.eql(combinedPath);
    mcp(base, 'notafile.yml,test1.json').should.eql(combinedPath);
  });

  it('2 YAML overwrite', function() {
    var config = fs.readFileSync(mcp(base, 'test1.yml,test2.yml'));
    config = yml.safeLoad(config);

    config.author.should.eql('bar');
    config.favorites.food.should.eql('candy');
    config.type.should.eql('dinosaur');

    config = fs.readFileSync(mcp(base, 'test2.yml,test1.yml'));
    config = yml.safeLoad(config);

    config.author.should.eql('foo');
    config.favorites.food.should.eql('sushi');
    config.type.should.eql('dinosaur');
  });

  it('2 JSON overwrite', function() {
    var config = fs.readFileSync(mcp(base, 'test1.json,test2.json'));
    config = yml.safeLoad(config);

    config.author.should.eql('waldo');
    config.favorites.food.should.eql('ice cream');
    config.type.should.eql('elephant');

    config = fs.readFileSync(mcp(base, 'test2.json,test1.json'));
    config = yml.safeLoad(config);

    config.author.should.eql('dinosaur');
    config.favorites.food.should.eql('burgers');
    config.type.should.eql('elephant');
  });

  it('JSON \& YAML overwrite', function() {
    var config = fs.readFileSync(mcp(base, 'test1.yml,test1.json'));
    config = yml.safeLoad(config);

    config.author.should.eql('dinosaur');
    config.favorites.food.should.eql('burgers');
    config.type.should.eql('elephant');

    config = fs.readFileSync(mcp(base, 'test1.json,test1.yml'));
    config = yml.safeLoad(config);

    config.author.should.eql('foo');
    config.favorites.food.should.eql('sushi');
    config.type.should.eql('dinosaur');
  });

  it('multifile warnings', function() {

  });
});
