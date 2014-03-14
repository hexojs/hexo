module.exports = function(grunt){
  grunt.initConfig({
    gitclone: {
      fontawesome: {
        options: {
          repository: 'https://github.com/FortAwesome/Font-Awesome.git',
          directory: 'tmp/fontawesome'
        },
      },
      fancybox: {
        options: {
          repository: 'https://github.com/fancyapps/fancyBox.git',
          directory: 'tmp/fancybox'
        }
      }
    },
    copy: {
      fontawesome: {
        expand: true,
        cwd: 'tmp/fontawesome/fonts/',
        src: ['**'],
        dest: 'source/css/fonts/'
      },
      fancybox: {
        expand: true,
        cwd: 'tmp/fancybox/source/',
        src: ['**'],
        dest: 'source/fancybox/'
      }
    },
    _clean: {
      tmp: ['tmp'],
      fontawesome: ['source/css/fonts'],
      fancybox: ['source/fancybox']
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.renameTask('clean', '_clean');

  grunt.registerTask('fontawesome', ['gitclone:fontawesome', 'copy:fontawesome', '_clean:tmp']);
  grunt.registerTask('fancybox', ['gitclone:fancybox', 'copy:fancybox', '_clean:tmp']);
  grunt.registerTask('default', ['gitclone', 'copy', '_clean:tmp']);
  grunt.registerTask('clean', ['_clean']);
};