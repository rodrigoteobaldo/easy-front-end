/**
 *
 *  Front End Starter Kit
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var svgo = require('imagemin-svgo');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.0',
  'bb >= 10'
];

// Optimize images
gulp.task('images', function () {
  return gulp.src([
    // Ignore
    '!app/assets/images/icons/*',

    'app/assets/images/**/*'
  ])
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true,
    use: [
      svgo({
        plugins: [
          {removeEmptyAttrs: true},
          {removeUselessStrokeAndFill: true}]
      })
    ]
  })))
  .pipe(gulp.dest('dist/images'))
  .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  return gulp.src([
    // Ignore
    '!app/layouts/application.html',
    '!app/components',
    '!app/pages',
    '!app/*.html',
    '!app/assets/',

    'app/*',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    buffer: false,
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(['app/assets/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/assets/styles/*.{scss,sass}',
    'app/assets/styles/**/*.css'
  ])
    .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
    .pipe($.sourcemaps.init())
    .pipe($.changed('.tmp/styles'))
    .pipe($.sass({ precision: 10 }))
    .pipe($.cssimport())
    .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.stream())
    .pipe($.size({title: 'styles'}));
});

gulp.task('templates:build', ['templates:clean'], function () {
  return gulp.src(['app/pages/**/*.html'])
    .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
    .pipe($.frontMatter())
    .pipe($.layout(function(file) {
      file.frontMatter.layout = 'app/layouts/application.html';
      file.frontMatter.engine = 'ejs';
      return file.frontMatter;
    }))
    .pipe($.hb({
      bustCache: true,
      partials: './app/components/**/*.hbs'
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('templates:clean', del.bind(null, ['.tmp/**/*.html', 'dist/**/*.html'], {dot: true}));

// Scan your HTML for assets & optimize them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app,app/assets}'});

  return gulp.src('.tmp/**/*.html')
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))

    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Insert SVG Inline
    // .pipe($.svgIcons.replace())
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output files
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'html'}));
});

// Clean output directory
gulp.task('clean', function () {
  $.cache.clearAll();
  del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true});
});

// Watch files for changes & reload
gulp.task('serve', ['icons', 'styles', 'templates:build'], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'FESK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app', 'app/assets', 'app/layouts']
  });

  gulp.watch(['app/icons/*.svg'], ['icons', browserSync.reload]);
  gulp.watch(['app/**/*.{html,hbs}'], ['templates:build', browserSync.reload]);
  gulp.watch(['app/assets/styles/**/*.{scss,css}'], ['styles']);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'FESK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
  runSequence('icons', 'styles', 'templates:build', ['html', 'images', 'fonts', 'copy'], cb);
});
