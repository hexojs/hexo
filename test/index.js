'use strict';

const chai = require('chai');
global.should = chai.should();

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
