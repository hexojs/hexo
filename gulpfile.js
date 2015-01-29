'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

var lib = 'lib/**/*.js';
var test = 'test/scripts/**/*.js';

gulp.task('coverage', function(){
  return gulp.src(lib)
    .pipe($.istanbul())
    .pipe($.istanbul.hookRequire());
});

gulp.task('coverage:clean', function(callback){
  del(['coverage/**/*'], callback);
});

function mochaStream(){
  return gulp.src('test/index.js', {read: false})
    .pipe($.mocha({
      reporter: 'spec'
    }));
}

gulp.task('mocha', ['coverage'], function(){
  return mochaStream()
    .pipe($.istanbul.writeReports());
});

gulp.task('mocha:nocov', function(){
  return mochaStream();
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