var path = require('path'),
  async = require('async'),
  clc = require('cli-color'),
  moment = require('moment'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

extend.console.register('init', 'Initialize', function(args){
  var target = process.cwd();

  if (args[0]) target = path.resolve(target, args[0]);

  async.auto({
    // Clone theme
    theme: function(next){
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
    // Create folders
    source: function(next){
      file.mkdir(target + '/source', next);
    },
    post_folder: ['source', function(next){
      file.mkdir(target + '/source/_posts', next);
    }],
    draft_folder: ['source', function(next){
      file.mkdir(target + '/source/_drafts', next);
    }],
    // Create package.json
    package: function(next){
      var pkg = {
        name: 'hexo',
        version: '0.0.1',
        private: true,
        engines: {
          'node': '>0.6.0',
          'npm': ">1.1.0"
        },
        dependencies: {}
      };

      file.write(target + '/package.json', JSON.stringify(pkg, null, '  ') + '\n', next);
    },
    // Create .gitignore
    gitignore: function(next){
      file.write(target + '/.gitignore', '.DS_Store\nnode_modules', next);
    },
    // Create config file
    config: function(next){
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
        '# Hexo uses Connect to serve static files',
        '# Reference: http://www.senchalabs.org/connect/',
        'port: 4000',
        'logger: false',
        'logger_format:',
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
    },
    // Create a Hello World post
    post: ['post_folder', 'draft_folder', function(next){
      var content = [
        '---',
        'layout: post',
        'title: Hello World',
        'date: ' + moment().format('YYYY-MM-DD HH:mm:ss'),
        'comments: true',
        'tags: ',
        '---',
        '',
        'Welcome to [Hexo](https://github.com/tommy351/hexo)! This is your very first post. Check [documentaion](https://github.com/tommy351/hexo/wiki) to learn how to use.'
      ];

      file.write(target + '/source/_posts/hello-world.md', content.join('\n'), next);
    }]
  }, function(){
    console.log('Hexo is setup at %s.', clc.bold(target));
  });
});