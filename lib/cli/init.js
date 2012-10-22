var path = require('path'),
  async = require('async'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

extend.console.register('init', 'Initialize', function(args){
  var target = process.cwd();

  if (args[0]) target = path.resolve(target, args[0]);

  async.parallel([
    function(next){
      file.mkdir(target + '/themes', function(){
        spawn({
          command: 'git',
          args: ['clone', 'git://github.com/tommy351/hexo-theme-light.git', target + '/themes/light'],
          exit: function(code){
            if (code === 0) next();
          }
        });
      });
    },
    function(next){
      file.mkdir(target + '/source', function(){
        async.parallel([
          function(next){
            file.mkdir(target + '/source/_posts', next);
          },
          function(next){
            file.mkdir(target + '/source/_drafts', next);
          }
        ], next);
      });
    },
    function(next){
      var pkg = {
        private: true,
        dependencies: {}
      };

      file.write(target + '/package.json', JSON.stringify(pkg, null, '  ') + '\n', next);
    },
    function(next){
      var config = [
        '# Basic',
        'title: Hexo',
        'subtitle: Node.js blog framework',
        'description:',
        'url: http://yoursite.com',
        'author: John Doe',
        'email:',
        'language:',
        '',
        '# Permalink',
        'root: /',
        'permalink: :year/:month/:day/:title/',
        'tag_dir: tags',
        'archive_dir: archives',
        'category_dir: posts',
        '',
        '# Archives',
        '# 2: Paginate result',
        '# 1: Display result in same page',
        '# 0: Disable',
        'archive: 2',
        'category: 2',
        'tag: 2',
        '',
        '# Server',
        'port: 4000',
        '',
        '# Date / Time format',
        '# Hexo uses Moment.js to parse and display date',
        '# Reference: http://momentjs.com/docs/#/displaying/format/',
        'date_format: MMM D, YYYY',
        'time_format: H:mm:ss',
        '',
        '# Pagination',
        'per_page: 10',
        'pagination_dir: page',
        '',
        '# Disqus',
        'disqus_shortname:',
        '',
        '# Extensions',
        'plugins:',
        'theme: light',
        '',
        '# Enhancement',
        'auto_spacing: false',
        'titlecase: false',
        '',
        '# Deployment',
        '# Type: github, heroku',
        '# Read documentaion for more information',
        'deploy:',
        '  type:'
      ];

      file.write(target + '/_config.yml', config.join('\n'), next);
    }
  ], function(){
    console.log('Hexo is setup at %s.', target);
  });
});