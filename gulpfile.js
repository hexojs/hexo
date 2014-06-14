var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  path = require('path');

var lib = 'lib/**/*.js',
  test = 'test/scripts/**/*.js';

var handleError = function(err){
  console.error(err.stack);
  this.emit('end');
};

gulp.task('mocha', function(){
  return gulp.src('test/scripts/index.js')
    .pipe(mocha({
      reporter: 'spec',
      ignoreLeaks: true
    }).on('error', handleError));
});

gulp.task('jshint', function(){
  return gulp.src(lib)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('watch', function(){
  gulp.watch(lib, ['mocha', 'jshint']);
  gulp.watch(test, ['mocha']);
});

gulp.task('test', ['mocha', 'jshint']);