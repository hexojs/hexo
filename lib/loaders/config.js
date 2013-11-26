var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async'),
  _ = require('lodash'),
  HexoError = require('../error');

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
  theme: 'light',
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
    configPath = path.join(baseDir, '_config.yml');

  hexo.config = {};
  hexo.env.init = false;

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
        if (err) return hexo.log.e(HexoError.wrap(err, 'Configuration file load failed'));

        var config = hexo.config = _.extend(defaults, result);
        hexo.env.init = true;

        var baseDir = hexo.base_dir;

        hexo.constant('public_dir', joinPath(baseDir, config.public_dir))
            .constant('source_dir', joinPath(baseDir, config.source_dir))
            .constant('plugin_dir', joinPath(baseDir, 'node_modules'))
            .constant('script_dir', joinPath(baseDir, 'scripts'))
            .constant('scaffold_dir', joinPath(baseDir, 'scaffolds'));

        hexo.constant('theme_dir', function(){
          return joinPath(baseDir, 'themes', config.theme);
        });

        hexo.constant('theme_script_dir', function(){
          return joinPath(hexo.theme_dir, 'scripts');
        });

        hexo.log.d('Configuration file load successfully');
        next();
      });
    }
  ], callback);
};