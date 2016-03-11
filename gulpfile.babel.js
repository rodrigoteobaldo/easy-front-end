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
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import svgo from 'imagemin-svgo';
import panini from 'panini';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const AUTOPREFIXER_BROWSERS = [
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
gulp.task('images', () => {
  return gulp.src([
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
gulp.task('copy', () => {
  return gulp.src([
    // Ignore
    '!app/layouts/*.html',
    '!app/components/',
    '!app/pages/',
    '!app/*.html',
    '!app/assets/',
    '!app/layouts/',

    'app/*',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    buffer: false,
    dot: true
  }).pipe(gulp.dest('dist'));
});

// Copy web fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['app/assets/fonts/**'])
    .pipe(gulp.dest('dist/fonts'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
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
    .pipe($.cssnano({
      autoprefixer: { browsers: AUTOPREFIXER_BROWSERS },
      discardComments: { removeAll: true }
    }))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream())
    .pipe($.size({title: 'styles'}));
});

gulp.task('templates:build', ['templates:clean'], () => {
  return gulp.src(['app/pages/**/*.html'])
    .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
    .pipe(panini({
      root: 'app/pages',
      layouts: 'app/layouts',
      partials: 'app/components'
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('templates:clean', del.bind(null, ['.tmp/**/*.html', 'dist/**/*.html'], {dot: true}));

// Scan your HTML for assets & optimize them
gulp.task('scripts', () => {
  return gulp.src('.tmp/**/*.html')
    .pipe($.useref({
      searchPath: ['app/assets', 'node_modules']
    }))
    .pipe($.if('*.js', $.babel()))
    .pipe($.if('*.js', $.uglify({preserveComments: 'license'})))
    .pipe(gulp.dest('.tmp'))
    // adicionar sourcemaps
    .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => {
  $.cache.clearAll();
  del(['.tmp', 'dist/*', '!dist/.git'], {dot: true});
});

// Watch files for changes & reload
gulp.task('serve', ['clean'], () => {
  runSequence(
    'styles',
    'templates:build',
    ['scripts'],
    () => {
      browserSync({
        notify: false,
        logPrefix: 'FESK',
        // https: true,
        server: ['.tmp', 'app', 'app/assets/', 'node_modules']
      });
    }
  );


  gulp.watch(['app/**/*.{html,hbs}'], ['templates:build', reload]);
  gulp.watch(['app/assets/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['app/assets/styles/**/*.{js}'], ['scripts']);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () => {
  browserSync({
    notify: false,
    logPrefix: 'FESK',
    // https: true,
    server: 'dist'
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], () => {
  runSequence(
    'styles',
    'templates:build',
    ['scripts', 'fonts', 'images', 'copy']
  );
});
