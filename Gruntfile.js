module.exports = function(grunt){
  grunt.initConfig({
    mocha: {
      lib: {
        options: {
          reporter: 'dot'
        },
        src: ['test/**/*.test.js']
      }
    },
    watch: {
      mocha: {
        files: ['lib/**/*.js', 'test/**/*.test.js'],
        tasks: ['mocha:lib']
      },
      jshint: {
        files: ['lib/**/*.js'],
        tasks: ['jshint:lib']
      }
    },
    jshint: {
      options: {
        '-W103': true
      },
      lib: ['lib/**/*.js']
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['mocha', 'jshint']);
  grunt.registerTask('dev', ['watch']);
};