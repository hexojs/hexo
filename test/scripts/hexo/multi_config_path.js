'use strict';

var pathFn = require('path');
var osFn = require('os');
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
    this.d = function(...args) {
      var type = 'debug';
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

  var testJson3 = [
    '{',
    '"author": "james bond",',
    '"favorites": {',
    '  "food": "martini",',
    '  "ice_cream": "vanilla"',
    '  }',
    '}'
  ].join('\n');

  before(() => {
    fs.writeFileSync(base + 'test1.yml', testYaml1);
    fs.writeFileSync(base + 'test2.yml', testYaml2);
    fs.writeFileSync(base + 'test1.json', testJson1);
    fs.writeFileSync(base + 'test2.json', testJson2);
    fs.writeFileSync('/tmp/test3.json', testJson3);
  });

  afterEach(() => {
    hexo.log.reader = [];
  });

  after(() => {
    fs.rmdirSync(hexo.base_dir);
    fs.unlinkSync('/tmp/test3.json');
  });

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

    mcp(base, '/tmp/test3.json').should.eql('/tmp/test3.json');
  });

  it('1 not found file warning', () => {
    var notFile = 'not_a_file.json';

    mcp(base, notFile).should.eql(pathFn.join(base, '_config.yml'));
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('Config file ' + notFile
                          + ' not found, using default.');
  });

  it('1 not found file warning absolute', () => {
    let notFile = '/tmp/not_a_file.json';

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
    hexo.log.reader[6].type.should.eql('warning');
    hexo.log.reader[6].msg.should.eql('Config file notafile.yml not found.');
    hexo.log.reader[7].type.should.eql('info');
    hexo.log.reader[7].msg.should.eql('Config based on 1 files');
    // because who cares about grammar anyway?

    mcp(base, 'notafile.yml,alsonotafile.json').should.not.eql(combinedPath);
    hexo.log.reader[11].type.should.eql('error');
    hexo.log.reader[11].msg.should.eql('No config files found.'
                                     + ' Using _config.yml.');
  });

  it('combine config output with absolute paths', () => {
    var combinedPath = pathFn.join(base, '_multiconfig.yml');

    mcp(base, 'test1.json,/tmp/test3.json').should.eql(combinedPath);
    hexo.log.reader[0].type.should.eql('info');
    hexo.log.reader[0].msg.should.eql('Config based on 2 files');
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

  it('write multiconfig to specified path', () => {
    let outputPath = osFn.tmpdir();
    let combinedPath = pathFn.join(outputPath, '_multiconfig.yml');

    mcp(base, 'test1.yml', outputPath).should.not.eql(combinedPath);
    mcp(base, 'test1.yml,test2.yml', outputPath).should.eql(combinedPath);
    mcp(base, 'test1.yml,test1.json', outputPath).should.eql(combinedPath);
    mcp(base, 'test1.json,test2.json', outputPath).should.eql(combinedPath);
    mcp(base, 'notafile.yml,test1.json', outputPath).should.eql(combinedPath);
    mcp(base, 'notafile.yml,alsonotafile.json', outputPath).should.not.eql(combinedPath);

    hexo.log.reader[1].type.should.eql('debug');
    hexo.log.reader[1].msg.should.eql(`Writing _multiconfig.yml to ${combinedPath}`);
    hexo.log.reader[2].type.should.eql('info');
    hexo.log.reader[2].msg.should.eql('Config based on 2 files');
    hexo.log.reader[6].type.should.eql('warning');
    hexo.log.reader[6].msg.should.eql('Config file notafile.yml not found.');
    hexo.log.reader[7].type.should.eql('info');
    hexo.log.reader[7].msg.should.eql('Config based on 1 files');
    hexo.log.reader[11].type.should.eql('error');
    hexo.log.reader[11].msg.should.eql('No config files found.'
                                     + ' Using _config.yml.');
  });
});
