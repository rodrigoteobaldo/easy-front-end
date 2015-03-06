/*jslint node: true */
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var nib = require('nib');
var jeet = require('jeet');

var ASSETS_PATH = './app/assets/';
var BOWER_PATH = './bower_components/';

gulp.task('build:compressImages', function () {
  return gulp.src(ASSETS_PATH + 'images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('build:minifyHtml', function () {
  var options = {
    conditionals: true
  };

  return gulp.src('dist/')
  .pipe($.minifyHtml(options))
  .pipe(gulp.dest('dist/'));
});

gulp.task('templates', function () {
  var options = {
    ignorePartials: true,
    batch : ['./app/partials']
  };

  return gulp.src('app/pages/*.html')
  .pipe($.compileHandlebars(null, options))
  .pipe($.rename(function(path) {
    path.extname = '.html';
  }))
  .pipe(gulp.dest('dist'));
});

gulp.task('stylus', function () {
  return gulp.src(ASSETS_PATH + 'stylesheets/*.styl')
  .pipe($.stylus({ use: [nib(), jeet()] }).on('error', function(err) {
    console.log(err.stack);
    this.emit('end');
  }))
  .pipe(gulp.dest('dist/stylesheets/'));
});

gulp.task('usemin', function () {
  var options = {
    conditionals: true
  };

  return gulp.src('./app/pages/*.html')
  .pipe($.usemin({
    css: ['concat'],
    html: [$.minifyHtml(options)],
    js: ['concat']
  }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('build:jsCompile', function () {
  return gulp.src(ASSETS_PATH + 'scripts/application.js')
  .pipe($.include())
  .pipe($.closureCompiler({
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
  gulp.watch("app/assets/scripts/**/*.js", ['usemin']);
  gulp.watch("app/**/*", ['usemin', 'build:extras']).on('change', browserSync.reload);
});

gulp.task('build:extras', function () {
  return gulp.src([
    'app/*.*',
    'app/fonts/'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('build:copyHtml', function () {
  return gulp.src([
    'app/pages/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('build:clean', require('del').bind(null, ['dist']));

gulp.task('serve', [
  'stylus',
  'usemin',
  'build:extras',
  'browserSync'
]);

gulp.task('default', ['serve']);

gulp.task('build', [
  'build:clean',
  'stylus',
  'usemin',
  'build:compressImages',
  'build:minifyHtml',
  'build:extras'
]);
