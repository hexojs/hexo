'use strict';

describe('Core', () => {
  require('./hexo');
  require('./load_config');
  require('./validate_config');
  require('./load_database');
  require('./load_plugins');
  require('./load_theme_config');
  require('./locals');
  require('./multi_config_path');
  require('./post');
  require('./render');
  require('./router');
  require('./scaffold');
  require('./update_package');
});
