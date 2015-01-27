'use strict';

describe('Core', function(){
  require('./hexo');
  require('./load_config');
  require('./load_database');
  require('./load_plugins');
  require('./post');
  require('./render');
  require('./router');
  require('./scaffold');
  require('./update_package')
});