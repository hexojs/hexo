module.exports = function(grunt){
  grunt.initConfig({
    test: {
      app: {
        options: {
          reporter: 'dot'
        },
        src: ['test/**/*.test.js']
      }
    },
    watch: {
      test: {
        files: ['lib/**/*.js', 'test/**/*.test.js'],
        tasks: ['test:app']
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');

  grunt.registerTask('dev', ['watch']);
};