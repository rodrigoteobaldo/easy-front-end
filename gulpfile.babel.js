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
import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import del from 'del'
import runSequence from 'run-sequence'
import browserSync from 'browser-sync'
import svgo from 'imagemin-svgo'
import panini from 'panini'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'

const $ = gulpLoadPlugins()
const reload = browserSync.reload

/**
 * DESTINATION FOLDERS
 */

const Path = {
  VENDOR: './app/vendor',
  PUBLIC: './app/public',
  STYLES: './app/assets/styles',
  SCRIPTS: './app/assets/styles',
  IMAGES: './app/assets/images',
  FONTS: './app/assets/fonts'
}

const DEST_ROOT    = `./dist` // CAUTION: This directory will be automatically removed every build
const DEST_PUBLIC  = DEST_ROOT
const DEST_IMG     = `${DEST_ROOT}/images`
const DEST_FONTS   = `${DEST_ROOT}/fonts`
const DEST_SCRIPTS = `${DEST_ROOT}/scripts`
const DEST_STYLES  = `${DEST_ROOT}/styles`

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
  .pipe(gulp.dest(DEST_IMG))
  .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', () => {
  return gulp.src([
      'app/public/*',
      'node_modules/apache-server-configs/dist/.htaccess'
    ],
    {
    buffer: false,
    dot: true
  }).pipe(gulp.dest(DEST_ROOT));
});

// Copy web fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['app/assets/fonts/**'])
    .pipe(gulp.dest(DEST_FONTS));
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
    .pipe($.changed(DEST_STYLES))
    .pipe($.sass({ precision: 10 }))
    .pipe($.cssimport({ includePaths: [Path.VENDOR] }))
    .pipe($.cssnano({
      autoprefixer: { browsers: AUTOPREFIXER_BROWSERS, add: true },
      discardComments: { removeAll: true }
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(DEST_STYLES))
    .pipe(browserSync.stream())
    .pipe($.size({title: 'styles'}));
});

gulp.task('templates:build', () => {
  return gulp.src(['app/pages/**/*.html'])
    .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
    .pipe(panini({
      root: 'app/pages/',
      layouts: 'app/layouts/',
      partials: 'app/components/'
    }))
    .pipe(gulp.dest(DEST_ROOT))
    .on('finish', browserSync.reload);
});

gulp.task('templates:refresh', (done) => {
  panini.refresh();
  gulp.start('templates:build');
  done();
});

// Scan your HTML for assets & optimize them
gulp.task('scripts', () => {
  return webpackStream({
    entry: './app/assets/scripts/main.js',
    output: {
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ["es2015", {"modules": false }]
            ]
          }
        }
      ]
    },

    devtool: "source-map",

    plugins: [
      new webpack.optimize.UglifyJsPlugin({sourceMap: true})
    ]
  }, webpack)
  .pipe(gulp.dest(DEST_SCRIPTS));
});

// Clean output directory
gulp.task('clean', () => {
  $.cache.clearAll();
  return del([DEST_ROOT, `!${DEST_ROOT}/.git`], {dot: true});
});

// Watch files for changes & reload
gulp.task('serve', ['default'], () => {
  browserSync({
    notify: false,
    logPrefix: 'FESK',
    server: [DEST_ROOT],
    // https: true,
    // httpModule: "http2"
  })

  gulp.watch(['app/pages/**/*.{html,hbs}'], ['templates:build']);
  gulp.watch(['app/{layouts,components}/**/*.{html}'], ['templates:refresh']);
  gulp.watch(['app/assets/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['app/assets/scripts/**/*.{js}'], ['scripts']);
});

// // Build and serve the output from the dist build
// gulp.task('serve:dist', ['default'], () => {
//   browserSync({
//     notify: false,
//     logPrefix: 'FESK',
//     server: 'dist',
//     https: true,
//     httpModule: "http2"
//   });
// });

// Build production files, the default task
gulp.task('default', (cb) => {
  return runSequence(
    'clean',
    'styles',
    'templates:build',
    ['fonts', 'scripts', 'images', 'copy'],
    cb
  );
});
