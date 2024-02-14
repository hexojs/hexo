'use strict';

const pathFn = require('path');
const osFn = require('os');
const fs = require('hexo-fs');
const yml = require('js-yaml');

describe('config flag handling', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'test_dir'));

  const mcp = require('../../../dist/hexo/multi_config_path')(hexo);
  const base = hexo.base_dir;

  function ConsoleReader() {
    this.reader = [];
    this.d = function(...args) {
      const type = 'debug';
      let message = '';
      for (let i = 0; i < args.length;) {
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
      const type = 'info';
      let message = '';
      for (let i = 0; i < args.length;) {
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
      const type = 'warning';
      let message = '';
      for (let i = 0; i < args.length;) {
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
      const type = 'error';
      let message = '';
      for (let i = 0; i < args.length;) {
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

  const testYaml1 = [
    'author: foo',
    'type: dinosaur',
    'favorites:',
    '  food: sushi',
    '  color: purple'
  ].join('\n');

  const testYaml2 = [
    'author: bar',
    'favorites:',
    '  food: candy',
    '  ice_cream: chocolate'
  ].join('\n');

  const testJson1 = [
    '{',
    '"author": "dinosaur",',
    '"type": "elephant",',
    '"favorites": {"food": "burgers"}',
    '}'
  ].join('\n');

  const testJson2 = [
    '{',
    '"author": "waldo",',
    '"favorites": {',
    '  "food": "ice cream",',
    '  "ice_cream": "strawberry"',
    '  }',
    '}'
  ].join('\n');

  const testJson3 = [
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
    // not supported type
    fs.writeFileSync(base + 'test1.xml', '');
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

  it('not supported type', () => {
    mcp(base, 'test1.xml,test1.json').should.equal(base + '_multiconfig.yml');
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('Config file test1.xml not supported type.');
  });

  it('1 file', () => {
    mcp(base, 'test1.yml').should.eql(
      pathFn.resolve(base + 'test1.yml'));

    mcp(base, 'test1.json').should.eql(
      pathFn.resolve(base + 'test1.json'));

    mcp(base, '/tmp/test3.json').should.eql('/tmp/test3.json');
  });

  it('1 not found file warning', () => {
    const notFile = 'not_a_file.json';

    mcp(base, notFile).should.eql(pathFn.join(base, '_config.yml'));
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('Config file ' + notFile
      + ' not found, using default.');
  });

  it('1 not found file warning absolute', () => {
    const notFile = '/tmp/not_a_file.json';

    mcp(base, notFile).should.eql(pathFn.join(base, '_config.yml'));
    hexo.log.reader[0].type.should.eql('warning');
    hexo.log.reader[0].msg.should.eql('Config file ' + notFile
      + ' not found, using default.');
  });

  it('combined config output', () => {
    const combinedPath = pathFn.join(base, '_multiconfig.yml');

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
    hexo.log.reader[11].msg.should.eql('No config files found. Using _config.yml.');
  });

  it('combine config output with absolute paths', () => {
    const combinedPath = pathFn.join(base, '_multiconfig.yml');

    mcp(base, 'test1.json,/tmp/test3.json').should.eql(combinedPath);
    hexo.log.reader[0].type.should.eql('info');
    hexo.log.reader[0].msg.should.eql('Config based on 2 files');
  });

  it('2 YAML overwrite', () => {
    const configFile = mcp(base, 'test1.yml,test2.yml');
    let config = fs.readFileSync(configFile);
    config = yml.load(config);

    config.author.should.eql('bar');
    config.favorites.food.should.eql('candy');
    config.type.should.eql('dinosaur');

    config = fs.readFileSync(mcp(base, 'test2.yml,test1.yml'));
    config = yml.load(config);

    config.author.should.eql('foo');
    config.favorites.food.should.eql('sushi');
    config.type.should.eql('dinosaur');
  });

  it('2 JSON overwrite', () => {
    let config = fs.readFileSync(mcp(base, 'test1.json,test2.json'));
    config = yml.load(config);

    config.author.should.eql('waldo');
    config.favorites.food.should.eql('ice cream');
    config.type.should.eql('elephant');

    config = fs.readFileSync(mcp(base, 'test2.json,test1.json'));
    config = yml.load(config);

    config.author.should.eql('dinosaur');
    config.favorites.food.should.eql('burgers');
    config.type.should.eql('elephant');
  });

  it('JSON & YAML overwrite', () => {
    let config = fs.readFileSync(mcp(base, 'test1.yml,test1.json'));
    config = yml.load(config);

    config.author.should.eql('dinosaur');
    config.favorites.food.should.eql('burgers');
    config.type.should.eql('elephant');

    config = fs.readFileSync(mcp(base, 'test1.json,test1.yml'));
    config = yml.load(config);

    config.author.should.eql('foo');
    config.favorites.food.should.eql('sushi');
    config.type.should.eql('dinosaur');
  });

  it('write multiconfig to specified path', () => {
    const outputPath = osFn.tmpdir();
    const combinedPath = pathFn.join(outputPath, '_multiconfig.yml');

    mcp(base, 'test1.yml', outputPath).should.not.eql(combinedPath);
    mcp(base, 'test1.yml,test2.yml', outputPath).should.eql(combinedPath);
    mcp(base, 'test1.yml,test1.json', outputPath).should.eql(combinedPath);
    mcp(base, 'test1.json,test2.json', outputPath).should.eql(combinedPath);
    mcp(base, 'notafile.yml,test1.json', outputPath).should.eql(combinedPath);
    mcp(base, 'notafile.yml,alsonotafile.json', outputPath).should.not.eql(combinedPath);

    // delete /tmp/_multiconfig.yml
    fs.unlinkSync(combinedPath);

    hexo.log.reader[1].type.should.eql('debug');
    hexo.log.reader[1].msg.should.eql(`Writing _multiconfig.yml to ${combinedPath}`);
    hexo.log.reader[2].type.should.eql('info');
    hexo.log.reader[2].msg.should.eql('Config based on 2 files');
    hexo.log.reader[6].type.should.eql('warning');
    hexo.log.reader[6].msg.should.eql('Config file notafile.yml not found.');
    hexo.log.reader[7].type.should.eql('info');
    hexo.log.reader[7].msg.should.eql('Config based on 1 files');
    hexo.log.reader[11].type.should.eql('error');
    hexo.log.reader[11].msg.should.eql('No config files found. Using _config.yml.');
  });
});
