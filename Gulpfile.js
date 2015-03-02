/*jslint node: true */
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var nib = require('nib');

var ASSETS_PATH = './app/assets/';
var BOWER_PATH = './bower_components/';

gulp.task('compressImages', function () {
  return gulp.src(ASSETS_PATH + 'images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('minifyHtml', function () {
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
  .pipe($.stylus({ use: nib() }))
  .pipe(gulp.dest('dist/stylesheets/'));
});

gulp.task('jsConcat:application', function () {
  return gulp.src(ASSETS_PATH + 'scripts/**/*.js')
  .pipe($.concat('application.js', {newLine: ';'}))
  .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('jsConcat:vendor', function () {
  return gulp.src([
    BOWER_PATH + 'jquery/dist/jquery.js',
    BOWER_PATH + 'swiper/dist/js/swiper.js',
  ])
  .pipe($.concat('vendor.js', {newLine: ';\n'}))
  .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('jsCompile', function () {
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
  gulp.watch("app/assets/scripts/**/*.js", ['jsConcat:vendor', 'jsConcat:application']);
  gulp.watch("app/**/*.html", ['copyExtras']).on('change', browserSync.reload);
});

gulp.task('copyExtras', function () {
  return gulp.src([
    'app/*.*',
    'app/fonts/'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('copyHtml', function () {
  return gulp.src([
    'app/pages/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('serve', [
  'stylus',
  'jsConcat:vendor',
  'jsConcat:application',
  'copyHtml',
  'copyExtras',
  'browserSync'
]);

gulp.task('default', ['serve']);

gulp.task('build', [
  'clean',
  'stylus',
  'wiredep',
  'compressImages',
  'minifyHtml',
  'copyExtras'
]);
