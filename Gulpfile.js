'use strict';

var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var stylus = require('gulp-stylus');
var browserSync = require('browser-sync');
var include = require('gulp-include');

var ASSETS_PATH = './app/assets/';

gulp.task('stylus', function () {
  return gulp.src(ASSETS_PATH + 'stylesheets/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('dist/stylesheets/'));
});

gulp.task('jsConcat', function () {
  return gulp.src(ASSETS_PATH + 'scripts/application.js')
  .pipe(include())
  .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('jsCompile', function () {
  return gulp.src(ASSETS_PATH + 'scripts/application.js')
  .pipe(include())
  .pipe(closureCompiler({
    compilerPath: 'bower_components/closure-compiler/compiler.jar',
    fileName: 'application.min.js'
  }))
  .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: ['dist', './']
    },
    routes: {
      '/bower_components': 'bower_components'
    }
  });

  gulp.watch("app/assets/stylesheets/**/*.styl", ['stylus']);
  gulp.watch("app/assets/scripts/**/*.js", ['jsConcat']);
  gulp.watch("app/**/*.html", ['copyFiles']).on('change', browserSync.reload);
});

gulp.task('copyFiles', function () {
  return gulp.src([
    'app/*.*',
    'app/pages/*.html',
    'app/fonts/'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('serve', ['stylus', 'jsConcat', 'copyFiles', 'browserSync']);

gulp.task('default', ['serve']);
