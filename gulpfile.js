var gulp = require('gulp');
var less = require('gulp-less');
var clean = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var rename = require('gulp-rename');

gulp.task('images', function () {
  return gulp.src('./images/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant({ quality: '95', speed: 4 })]
  }))
  .pipe(gulp.dest('./images'));
});

gulp.task('scripts', function() {
  gulp.src(['scripts/*.js', '!scripts/*.min.js'])
  .pipe(uglify())
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest('./res'));
});

gulp.task('less', function () {
  gulp.src(['less/*.less', '!less/_*.less'])
  .pipe(less())
  .pipe(gulp.dest('./styles'));
});

gulp.task('css', function () {
  gulp.src(['styles/*.css', '!styles/*.min.css'])
  .pipe(clean({keepSpecialComments: 0}))
  .pipe(rename({ extname: '.min.css' }))
  .pipe(gulp.dest('./res'));
});

gulp.task('styles', ['less', 'css']);

gulp.task('default', ['images', 'scripts', 'styles']);
