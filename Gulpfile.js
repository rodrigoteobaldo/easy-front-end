/*jslint node: true */
'use strict';

var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var nib         = require('nib');
var jeet        = require('jeet');


// Paths
var DIST_PATH        = './dist/'; // Distribuition path
var ASSETS_PATH      = './app/assets/';
var VENDOR_PATH      = './bower_components/';
var STYLESHEETS_PATH = ASSETS_PATH + 'stylesheets/';
var JS_PATH          = ASSETS_PATH + 'scripts/';

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

  return gulp.src(DIST_PATH)
  .pipe($.minifyHtml(options))
  .pipe(gulp.dest(DIST_PATH));
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
  .pipe(gulp.dest(DIST_PATH));
});

gulp.task('stylus', function () {
  return gulp.src(ASSETS_PATH + 'stylesheets/*.styl')
  .pipe($.stylus({ use: [nib(), jeet()] }).on('error', function(err) {
    console.log(err.stack);
    this.emit('end');
  }))
  .pipe(gulp.dest(STYLESHEETS_PATH));
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
  .pipe(gulp.dest(DIST_PATH));
});

gulp.task('build:jsCompile', function () {
  return gulp.src(JS_PATH + 'all.js')
  .pipe($.include())
  .pipe($.closureCompiler({
    compilerPath: VENDOR_PATH + 'closure-compiler/compiler.jar',
    fileName: 'all.min.js'
  }))
  .pipe(gulp.dest(DIST_PATH + 'scripts/'));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: [DIST_PATH, './']
    },
    routes: {
      '/bower_components': VENDOR_PATH
    }
  });

  gulp.watch(STYLESHEETS_PATH + "**/*.styl", ['stylus']);
  gulp.watch(JS_PATH + "**/*.js", ['usemin']);
  gulp.watch("app/**/*", ['usemin', 'build:extras']).on('change', browserSync.reload);
});

gulp.task('build:extras', function () {
  return gulp.src([
    'app/*.*',
    'app/fonts/'
  ], {
    dot: true
  }).pipe(gulp.dest(DIST_PATH));
});

gulp.task('build:copyHtml', function () {
  return gulp.src([
    'app/pages/*'
  ], {
    dot: true
  }).pipe(gulp.dest(DIST_PATH));
});

gulp.task('build:clean', require('del').bind(null, [DIST_PATH]));

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
