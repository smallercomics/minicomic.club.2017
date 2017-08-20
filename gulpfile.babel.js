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
import concat from 'gulp-concat'
import imageResize from 'gulp-image-resize'
import revManifestReplacer from './src/gulp/revManifestReplacer'

const template = gulpHandlebars(handlebars)

const distPath = './dist'

gulp.task('clean', (cb)=> {
  rimraf(distPath, () => cb() );
})

gulp.task('tidy', () => {
  // fs.unlink(`${distPath}/images.json`, ()=>{})
  // fs.unlink(`${distPath}/styles.json`, ()=>{})
  // fs.unlink(`${distPath}/scripts.json`, ()=>{})
})

gulp.task('dotfiles', () => {
  return gulp.src('./src/.*')
    .pipe(gulp.dest(distPath))
})

gulp.task('styles', ['images'], () => {
  return gulp.src('./src/style/main.scss')
    .pipe(revManifestReplacer(JSON.parse(fs.readFileSync(`${distPath}/images-o.json`))))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rev())
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

const imageDerivativeTasks = [200,400,800,1000,1200].map(width=> {
  gulp.task(`images-${width}`, () => {
    return gulp.src('./src/img/*')
      .pipe(rename(function (path) {
        path.basename += `-${width}`;
      }))
      .pipe(imageResize({
        width : width,
        crop : false,
        upscale : false
      }))
      .pipe(rev())
      .pipe(gulp.dest(`./${distPath}`))
      .pipe(rev.manifest({ path: `images-${width}.json` }))
      .pipe(gulp.dest(distPath))
  })
  return `images-${width}`
})

gulp.task('images', imageDerivativeTasks, ()=>(
  gulp.src('./src/img/*')
    .pipe(rev())
    .pipe(gulp.dest(`./${distPath}`))
    .pipe(rev.manifest({ path: 'images-o.json' }))
    .pipe(gulp.dest(distPath))
))
   




gulp.task('index', ['assets', 'dotfiles'], function () {
    const templateData = {
      assets: Object.assign(
        {},
        JSON.parse(fs.readFileSync(`${distPath}/styles.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-o.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-200.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-400.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-800.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-1000.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/images-1200.json`)),
        JSON.parse(fs.readFileSync(`${distPath}/scripts.json`)),
      ),
      contributors: JSON.parse(fs.readFileSync('./src/conf/contributors.json')),
      previous: JSON.parse(fs.readFileSync('./src/conf/previously.json')),
    }
    const options = {
        partialsDirectory : ['./src/templates/partials']
    }
    handlebars.registerHelper('asset', (key,size) => {
      const assetKey = typeof size === 'number'? key.replace(/\.([jpg]{3})/, `-${size}.$1`): key;
      console.log(key, assetKey, templateData.assets[assetKey])
      return templateData.assets[assetKey]
    })
    
    handlebars.registerHelper('firstkeyval', obj => {
        for (var i in obj){
            return obj[i]
        }
    })

    return gulp.src('src/templates/*.handlebars')
        .pipe(template(templateData, options))
        .pipe(htmlmin({collapseWhitespace: true}))
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