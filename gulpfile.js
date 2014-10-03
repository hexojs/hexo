var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  path = require('path');

var lib = 'lib/**/*.js',
  test = 'test/scripts/**/*.js';

gulp.task('mocha', function(){
  return gulp.src('test/index.js')
    .pipe($.mocha({
      reporter: 'spec',
      ignoreLeaks: true
    }));
});

gulp.task('jshint', function(){
  return gulp.src(lib)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('watch', function(){
  gulp.watch(lib, ['mocha', 'jshint']);
  gulp.watch(['test/index.js', test], ['mocha']);
});

gulp.task('test', ['mocha', 'jshint']);