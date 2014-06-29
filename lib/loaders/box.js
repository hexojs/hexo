var fs = require('graceful-fs'),
  async = require('async'),
  util = require('../util'),
  Theme = require('../theme'),
  Source = require('../core/source'),
  Scaffold = require('../core/scaffold'),
  file = util.file2;

module.exports = function(callback){
  if (!hexo.env.init) return callback();

  async.parallel([
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
        /**
        * See {% crosslink Source %}.
        *
        * @property source
        * @type Source
        * @for Hexo
        */
        hexo.source = new Source();

        if (exist){
          next();
        } else {
          file.mkdirs(hexo.source_dir, next);
        }
      });
    },
    function(next){
      fs.exists(hexo.scaffold_dir, function(exist){
        /**
        * See {% crosslink Scaffold %}
        *
        * @property scaffold
        * @type Scaffold
        * @for Hexo
        */
        hexo.scaffold = new Scaffold();

        if (exist){
          hexo.scaffold.process(next);
        } else {
          file.mkdirs(hexo.scaffold_dir, function(err){
            if (err) return next(err);

            hexo.scaffold.process(next);
          });
        }
      });
    }
  ], callback);
};