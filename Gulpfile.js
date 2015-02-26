var gulp = require(gulp);
var closureCompiler = require('gulp-closure-compiler');
var stylus = require('gulp-stylus');

var ASSETS_PATH = './app/assets/';

gulp.task('stylus', function () {
  return gulp.src(ASSETS_PATH + 'stylesheets/**/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('./dist/stylesheets/'));
});

gulp.task('concat', function () {
  return gulp.src(ASSETS_PATH + 'scripts/**/*.js')
  .pipe(concat('application.js'))
  .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('jscompile', function () {
  return gulp.src(ASSETS_PATH + 'scripts/**/*.js')
  .pipe(concat())
  .pipe(closureCompiler({
    compilerPath: 'bower_components/closure-compiler/compiler.jar',
    fileName: 'application.min.js'
  }))
  .pipe(gulp.dest('./dist/scripts/'));
});
