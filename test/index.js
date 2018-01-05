'use strict';

var chai = require('chai');

chai.use(require('chai-as-promised'));

describe('Hexo', () => {
  require('./scripts/box');
  require('./scripts/console');
  require('./scripts/extend');
  require('./scripts/filters');
  require('./scripts/generators');
  require('./scripts/helpers');
  require('./scripts/hexo');
  require('./scripts/models');
  require('./scripts/processors');
  require('./scripts/renderers');
  require('./scripts/tags');
  require('./scripts/theme');
  require('./scripts/theme_processors');
});
