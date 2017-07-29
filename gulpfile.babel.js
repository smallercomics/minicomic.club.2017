import fs from 'fs'

import rimraf from 'rimraf'
import handlebars from 'handlebars'

import gulp from 'gulp'

import sass from 'gulp-sass'
import htmlmin from 'gulp-htmlmin'
import rename from 'gulp-rename'
import connect from 'gulp-connect'
import rev from 'gulp-rev'
import gulpHandlebars from 'gulp-handlebars-html'
import revCSSUrls from 'gulp-rev-css-url'
import concat from 'gulp-concat'

import revManifestReplacer from './src/gulp/revManifestReplacer'

const template = gulpHandlebars(handlebars)

const distPath = './dist'

gulp.task('clean', (cb)=> {
  rimraf(distPath, () => cb() );
})

gulp.task('tidy', () => {
  fs.unlink(`${distPath}/images.json`, ()=>{})
  fs.unlink(`${distPath}/styles.json`, ()=>{})
  fs.unlink(`${distPath}/scripts.json`, ()=>{})
})

gulp.task('dotfiles', () => {
  return gulp.src('./src/.*')
    .pipe(gulp.dest(distPath))
})

gulp.task('styles', ['images'], () => {
  return gulp.src('./src/style/main.scss')
    .pipe(revManifestReplacer(JSON.parse(fs.readFileSync(`${distPath}/images.json`))))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rev())
    .pipe(revCSSUrls())
    .pipe(gulp.dest(distPath))
    .pipe(rev.manifest({ path: 'styles.json' }))
    .pipe(gulp.dest(distPath))
})

gulp.task('scripts', ['styles'], () => {
  return gulp.src(['./src/js/vendor/*.js', './src/js/main.js'])
    .pipe(concat('main.js'))
    .pipe(rev())
    .pipe(gulp.dest(distPath))
    .pipe(rev.manifest({ path: 'scripts.json' }))
    .pipe(gulp.dest(distPath))
})

gulp.task('images', () => {
  return gulp.src('./src/img/*')
    .pipe(rev())
    .pipe(gulp.dest(`./${distPath}`))
    .pipe(rev.manifest({ path: 'images.json' }))
    .pipe(gulp.dest(distPath))
})



gulp.task('index', ['assets', 'dotfiles'], function () {
    const templateData = {
      assets: Object.assign(
        {},
        JSON.parse(fs.readFileSync(`${distPath}/styles.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/scripts.json`)),
      ),
      contributors: JSON.parse(fs.readFileSync('./src/conf/contributors.json')),
      previous: JSON.parse(fs.readFileSync('./src/conf/previously.json')),
    }
    const options = {
        partialsDirectory : ['./src/templates/partials']
    }
    handlebars.registerHelper('asset', key => templateData.assets[key])
    
    handlebars.registerHelper('firstkeyval', obj => {
        for (var i in obj){
            return obj[i]
        }
    })

    return gulp.src('src/templates/*.handlebars')
        .pipe(template(templateData, options))
        //.pipe(htmlmin({collapseWhitespace: true}))
        .pipe(rename((path) => path.extname='.html'))
        .pipe(gulp.dest(distPath));
})

gulp.task('watch', () => {
  gulp.watch('./src/**', ['index'])
})

gulp.task('webserver', ()=> {
  connect.server({
    root: distPath,
    livereload: true
  })
})

gulp.task('assets', ['scripts' ], (next) =>{
    next()
})


gulp.task('dev', ['index', 'watch', 'webserver']);

gulp.task('default', ['index'])