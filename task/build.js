/*jshint node:true*/
/**
 * Build js files using uglify.
 */
var gulp = require('gulp');
var clean = require('gulp-clean');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build-clean', ['jshint'], function () {
  return gulp.src(gulp.config.buildPath, {read: false})
  .pipe(clean({force: true}));
});

gulp.task('transpile', ['build-clean'], function () {
  return gulp.src(gulp.config.libPath + '/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel())
  /*.pipe(rename(function (path) {
      path.basename += ".src";
    }))*/
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest(gulp.config.buildPath));
});

/*gulp.task('uglify', ['build-clean'], function () {
  return gulp.src(gulp.config.libPath + '/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(uglify({
      mangle: false,
      compress: false,
      preserveComments: false
    }))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest(gulp.config.buildPath));
});*/

gulp.task('js', ['transpile']);
gulp.task('build', ['js']);
