module.exports = function(grunt){
  grunt.initConfig({
    stylus: {
      app: {
        files: {
          'public/css/error.css': ['assets/styl/error.styl']
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['stylus']);
};