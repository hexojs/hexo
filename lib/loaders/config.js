var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async'),
  _ = require('lodash'),
  HexoError = require('../error'),
  Theme = require('../theme'),
  Source = require('../core/source'),
  util = require('../util'),
  file = util.file2;

var defaults = {
  // Site
  title: 'Hexo',
  subtitle: '',
  description: '',
  author: 'John Doe',
  email: '',
  language: '',
  // URL
  url: 'http://yoursite.com',
  root: '/',
  permalink: ':year/:month/:day/:title/',
  tag_dir: 'tags',
  archive_dir: 'archives',
  category_dir: 'categories',
  code_dir: 'downloads/code',
  // Directory
  source_dir: 'source',
  public_dir: 'public',
  // Writing
  new_post_name: ':title.md',
  default_layout: 'post',
  auto_spacing: false,
  titlecase: false,
  external_link: true,
  max_open_file: 100,
  multi_thread: true,
  filename_case: 0,
  render_drafts: false,
  post_asset_folder: false,
  highlight: {
    enable: true,
    line_number: true,
    tab_replace: '',
  },
  // Category & Tag
  default_category: 'uncategorized',
  category_map: {},
  tag_map: {},
  // Archives
  archive: 2,
  category: 2,
  tag: 2,
  // Server
  port: 4000,
  server_ip: '0.0.0.0',
  logger: false,
  logger_format: '',
  // Date / Time format
  date_format: 'MMM D YYYY',
  time_format: 'H:mm:ss',
  // Pagination
  per_page: 10,
  pagination_dir: 'page',
  // Disqus
  disqus_shortname: '',
  // Extensions
  theme: 'landscape',
  exclude_generator: [],
  // Markdown
  markdown: {
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: true,
    smartLists: true,
    smartypants: true
  },
  // Stylus
  stylus: {
    compress: false
  },
  // Deployment
  deploy: {}
};

var joinPath = function(){
  var str = path.join.apply(this, arguments);

  if (str[str.length - 1] !== path.sep) str += path.sep;

  return str;
};

module.exports = function(callback){
  var baseDir = hexo.base_dir,
    configPath = hexo.configfile;

  /**
  * Configuration.
  *
  * @property config
  * @type Object
  * @for Hexo
  */

  hexo.config = {};

  async.series([
    function(next){
      fs.exists(configPath, function(exist){
        if (exist){
          next();
        } else {
          callback();
        }
      });
    },
    function(next){
      hexo.render.render({path: configPath}, function(err, result){
        if (err) return next(HexoError.wrap(err, 'Config file load failed'));

        var config = hexo.config = _.extend(defaults, result);
        hexo.env.init = true;

        var baseDir = hexo.base_dir;

        /**
        * The path of public directory.
        *
        * @property public_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('public_dir', joinPath(baseDir, config.public_dir));

        /**
        * The path of source directory.
        *
        * @property source_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('source_dir', joinPath(baseDir, config.source_dir));

        /**
        * The path of plugin directory.
        *
        * @property plugin_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('plugin_dir', joinPath(baseDir, 'node_modules'));

        /**
        * The path of script directory.
        *
        * @property script_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('script_dir', joinPath(baseDir, 'scripts'));

        /**
        * The path of scaffold directory.
        *
        * @property scaffold_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('scaffold_dir', joinPath(baseDir, 'scaffolds'));

        /**
        * The path of theme directory.
        *
        * @property theme_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('theme_dir', function(){
          return joinPath(baseDir, 'themes', config.theme);
        });

        /**
        * The path of theme script directory.
        *
        * @property theme_script_dir
        * @type String
        * @for Hexo
        */

        hexo.constant('theme_script_dir', function(){
          return joinPath(hexo.theme_dir, 'scripts');
        });

        next();
      });
    },
    function(next){
      fs.exists(hexo.theme_dir, function(exist){
        if (exist){
          /**
          * See {% crosslink Theme %}.
          *
          * @property theme
          * @type Theme
          * @for Hexo
          */
          hexo.theme = new Theme();
          next();
        } else {
          next(new Error('Theme ' + hexo.config.theme + ' does not exist.'));
        }
      });
    },
    function(next){
      fs.exists(hexo.source_dir, function(exist){
        if (exist){
          /**
          * See {% crosslink Source %}.
          *
          * @property source
          * @type Source
          * @for Hexo
          */
          hexo.source = new Source();
          next();
        } else {
          file.mkdirs(hexo.source_dir, next);
        }
      });
    }
  ], function(err){
    if (err) return callback(err);

    hexo.log.d('Config file loaded');
    callback();
  });
};