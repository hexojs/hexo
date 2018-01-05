'use strict';

var pathFn = require('path');
var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var yml = require('js-yaml');

describe('config flag handling', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'test_dir'));

  var mcp = require('../../../lib/hexo/multi_config_path')(hexo);
  var base = hexo.base_dir;

  function ConsoleReader() {
    this.reader = [];
    this.i = function(...args) {
      var type = 'info';
      var message = '';
      for (var i = 0; i < args.length;) {
        message += args[i];
        if (++i < args.length) {
          message += ' ';
        }
      }

      this.reader.push({
        type,
        msg: message
      });
    }.bind(this);

    this.w = function(...args) {
      var type = 'warning';
      var message = '';
      for (var i = 0; i < args.length;) {
        message += args[i];
        if (++i < args.length) {
          message += ' ';
        }
      }

      this.reader.push({
        type,
        msg: message
      });
    }.bind(this);

    this.e = function(...args) {
      var type = 'error';
      var message = '';
      for (var i = 0; i < args.length;) {
        message += args[i];
        if (++i < args.length) {
          message += ' ';
        }
      }

      this.reader.push({
        type,
        msg: message
      });
    }.bind(this);
  }

  hexo.log = new ConsoleReader();

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

  before(() => {
    fs.writeFileSync(base + 'test1.yml', testYaml1);
    fs.writeFileSync(base + 'test2.yml', testYaml2);
    fs.writeFileSync(base + 'test1.json', testJson1);
    fs.writeFileSync(base + 'test2.json', testJson2);
  });

  afterEach(() => {
    hexo.log.reader = [];
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('no file', () => {
    mcp(base).should.equal(base + '_config.yml');
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('No config file entered.');
  });

  it('1 file', () => {
    mcp(base, 'test1.yml').should.eql(
      pathFn.resolve(base + 'test1.yml'));

    mcp(base, 'test1.json').should.eql(
      pathFn.resolve(base + 'test1.json'));
  });

  it('1 not found file warning', () => {
    var notFile = 'not_a_file.json';

    mcp(base, notFile).should.eql(pathFn.join(base, '_config.yml'));
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('Config file ' + notFile
                          + ' not found, using default.');
  });

  it('combined config output', () => {
    var combinedPath = pathFn.join(base, '_multiconfig.yml');

    mcp(base, 'test1.yml').should.not.eql(combinedPath);
    mcp(base, 'test1.yml,test2.yml').should.eql(combinedPath);
    mcp(base, 'test1.yml,test1.json').should.eql(combinedPath);
    mcp(base, 'test1.json,test2.json').should.eql(combinedPath);
    mcp(base, 'notafile.yml,test1.json').should.eql(combinedPath);

    hexo.log.reader[0].type.should.eql('info');
    hexo.log.reader[0].msg.should.eql('Config based on 2 files');
    hexo.log.reader[3].type.should.eql('warning');
    hexo.log.reader[3].msg.should.eql('Config file notafile.yml not found.');
    hexo.log.reader[4].type.should.eql('info');
    hexo.log.reader[4].msg.should.eql('Config based on 1 files');
    // because who cares about grammar anyway?

    mcp(base, 'notafile.yml,alsonotafile.json').should.not.eql(combinedPath);
    hexo.log.reader[7].type.should.eql('error');
    hexo.log.reader[7].msg.should.eql('No config files found.'
                                     + ' Using _config.yml.');
  });

  it('2 YAML overwrite', () => {
    var configFile = mcp(base, 'test1.yml,test2.yml');
    var config = fs.readFileSync(configFile);
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

  it('2 JSON overwrite', () => {
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

  it('JSON & YAML overwrite', () => {
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
});
