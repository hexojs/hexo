var path = require('path');

require('../lib/init')(path.join(__dirname, 'blog'), {_: [], test: true});

require('./i18n');
require('./log');
require('./router');
require('./tag');
require('./util');