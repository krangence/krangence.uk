var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var s3 = require('gulp-s3');
var cloudfront = require('gulp-cloudfront-invalidate');

var AWS = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: "krangence.uk",
  region: "eu-west-1"
}

var settings = {
  distribution: 'E31SNCT24FO6KP',
  paths: ['/*'],
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  wait: false
}

gulp.task('hugo-build', shell.task(['./bin/hugo']))

gulp.task('minify-html', () => {
  return gulp.src('./public/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true,
    }))
    .pipe(gulp.dest('./public'))
});

gulp.task('upload', () => {
  gulp.src('./public/**').pipe(s3(AWS));
});

gulp.task('invalidate', function () {
  return gulp.src('*')
    .pipe(cloudfront(settings));
});

gulp.task('build', ['hugo-build'], (callback) => {
  runSequence('minify-html', 'upload', 'invalidate', callback)
});