var path = require('path'),
  async = require('async'),
  spawn = require('child_process').spawn,
  util = require('../util'),
  log = util.log,
  file = util.file;

module.exports = function(args){
  var target = process.cwd();

  if (args[0]) target = path.resolve(target, args[0]);

  async.parallel([
    function(next){
      file.mkdir(target + '/plugins', next);
    },
    function(next){
      file.mkdir(target + '/themes', function(){
        var clone = spawn('git', ['clone', 'git://github.com/tommy351/hexo-theme-light.git', target + '/themes/light']);
        
        clone.stdout.setEncoding('utf8');
        clone.stdout.on('data', function(data){
          log.info(data);
        });

        clone.stderr.setEncoding('utf8');
        clone.stderr.on('data', function(data){
          log.error(data);
        });

        clone.on('exit', function(code){
          if (code == 0){
            next();
          } else {
            log.error(code);
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
            file.mkdir(target + '/source/_stash', next);
          }
        ], next);
      });
    },
    function(next){
      var config = [
        '# Basic',
        'title: Hexo',
        'subtitle: Fastest blogging framework',
        'description:',
        'url: http://yoursite.com',
        'author: John Doe',
        'email:',
        '',
        '# Permalink',
        'permalink: :year/:month/:day/:title',
        'tag_dir: tags',
        'archive_dir: archives',
        'category: posts',
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
        'plugins: []',
        'themes: light'
      ];

      file.write(target + '/_config.yml', config.join('\n'), next);
    }
  ], function(){
    log.success('Hexo is initalized.');
  });
};