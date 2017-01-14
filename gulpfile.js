'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');

const sass = require('gulp-sass');

const concat = require('gulp-concat');

const uglify = require('gulp-uglify');

const image = require('gulp-image');

const handlebars = require('handlebars');
const gulpHandlebars = require('gulp-handlebars-html')(handlebars);
const rename = require('gulp-rename');

handlebars.registerHelper('firstkeyval', function(obj) {
  for (var i in obj){
      return obj[i];
      break;
  }
});

gulp.task('webserver', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('sass', function () {
  return gulp.src('./src/style/main.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});


 
gulp.task('scripts', function() {
  return gulp.src(['./src/js/vendor/*.js', './src/js/main.js'])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('image', function () {
  gulp.src('./src/img/*')
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('index', function () {
    var templateData = {
        contributors: require('./src/conf/contributors'),
        previous: require('./src/conf/previous')
    }
    var options = {
        partialsDirectory : ['./src/templates/partials']
    }
 
    return gulp.src('src/templates/index.handlebars')
        .pipe(gulpHandlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch('./src/**', ['sass', 'scripts', 'image','index']);
});

gulp.task('build', ['sass', 'scripts', 'image','index']);

gulp.task('default', ['build', 'watch', 'webserver']);