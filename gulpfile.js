var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var rename = require('gulp-rename');

gulp.task('images', function () {
  return gulp.src('./images/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest('./images'));
});

gulp.task('scripts', function() {
  gulp.src(['scripts/*.js', '!scripts/*.min.js'])
  .pipe(uglify())
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest('./scripts'));
});

gulp.task('less', function () {
  gulp.src(['less/*.less', '!less/_*.less'])
  .pipe(less())
  .pipe(gulp.dest('./styles'))
  .pipe(minifyCSS({keepSpecialComments: 0}))
  .pipe(rename({ extname: '.min.css' }))
  .pipe(gulp.dest('./styles'));
});

gulp.task('styles', ['less', 'css']);

gulp.task('default', ['images', 'scripts', 'less']);
