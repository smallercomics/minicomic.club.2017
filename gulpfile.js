'use strict';

const fs = require('fs');

const gulp = require('gulp');
const connect = require('gulp-connect');

const sass = require('gulp-sass');

const concat = require('gulp-concat');

const uglify = require('gulp-uglify');

const image = require('gulp-image');

const handlebars = require('handlebars');
const gulpHandlebars = require('gulp-handlebars-html')(handlebars);
const rename = require('gulp-rename');

const markdown = require('gulp-marked-json');
const HBS = require('gulp-hbs');

/**
 * I'm using two different handlebars plugins here and I hate it.
 */
[handlebars,HBS].forEach(function(h){
  h.registerHelper('firstkeyval', function(obj) {
    for (var i in obj){
        return obj[i];
        break;
    }
  });
  
})

HBS.handlebars.logger.level = 0;

fs.readdir('./src/templates/partials/', function(err, filenames) {
    filenames.forEach(function(filename) {
      fs.readFile('./src/templates/partials/' + filename, 'utf-8', function(err, content) {
        HBS.registerPartial(filename.replace('.handlebars',''), content)
      });
    });
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

gulp.task('pages', function(){
  gulp.src('./src/pages/*.md')
    .pipe(markdown({
        pedantic: true,
        smartypants: true
    }))
    .pipe(HBS('./src/templates/page.handlebars'))
    .pipe(gulp.dest('./dist'));
})


gulp.task('watch', function () {
  gulp.watch('./src/**', ['sass', 'scripts', 'image','index', 'pages']);
});

gulp.task('build', ['sass', 'scripts', 'image','index', 'pages']);

gulp.task('default', ['build', 'watch', 'webserver']);