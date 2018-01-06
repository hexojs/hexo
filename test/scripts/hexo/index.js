'use strict';

describe('Core', () => {
  require('./hexo');
  require('./load_config');
  require('./load_database');
  require('./load_plugins');
  require('./locals');
  require('./multi_config_path');
  require('./post');
  require('./render');
  require('./router');
  require('./scaffold');
  require('./update_package');
});
