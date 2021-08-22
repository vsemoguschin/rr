const { src, dest, task, series, watch, parallel } = require("gulp");
const gulp = require('gulp');
const rm = require('gulp-rm')
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');
const { SRC_PATH, DIST_PATH, STYLE_LIBS, JS_LIBS } = require('./gulp.config');
const gulpif = require('gulp-if');

sass.compiler = require('node-sass');

task('clean', () => {
    return src(`${DIST_PATH}/**/*`, { read: false })
        .pipe(rm())
})

task('copy:html', () => {
    return src('./*.html')
        .pipe(dest(`${DIST_PATH}`))
        .pipe(reload({ stream: true }));
})

const styles = [
    'node_modules/normalize.css/normalize.css',
    './main.scss'
];

task('styles', () => {
    return src(STYLE_LIBS)
        .pipe(concat('main.scss'))
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        //.pipe(px2rem())
        .pipe(autoprefixer({ //обработка после преобразования scss в css
            browsers: ['last 2 versions'],
            cascade: false
        }))
        // .pipe(gcmq())
        .pipe(cleanCSS())//минификация
        .pipe(sourcemaps.write())
        .pipe(dest(`${DIST_PATH}`))
        .pipe(reload({ stream: true }));
});

task('icons', () => {
    return src('/img/icons/*.svg')
        .pipe(svgo({
            plugins: [
                {
                    removeAttrs: {
                        attrs: '(fill|stroke|style|width|height|data.*)'
                    }
                }
            ]
        }))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(dest(`${DIST_PATH}/img/icons`));
});

task('img', () => {
    return src('./img/**/*')
        .pipe(dest(`${DIST_PATH}/img`));
});

task('server', () => {
    browserSync.init({
        server: {
            baseDir: `./${DIST_PATH}`
        },
        // open: false
    });
});

const libs = [
    'node_modules/jquery/dist/jquery.js',
    './scripts/*.js'
];

task('scripts', () => {
    return src(libs)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js', { newLine: ';' }))
        .pipe(sourcemaps.write())
        .pipe(dest(`${DIST_PATH}`));
});

// task('scripts', () => {
//     return src(STYLE_LIBS)
//       .pipe(sourcemaps.init())
//       .pipe(concat('main.min.js', {newLine: ';'}))
//       .pipe(babel({
//         presets: ['@babel/env']
//       }))
//       .pipe(uglify())
//       .pipe(sourcemaps.write())
//       .pipe(dest('${DIST_PATH}'))
//       .pipe(reload({ stream: true }));
//    });



watch('./*.scss', series('styles'));
watch('./*.html', series('copy:html'));
watch('./scripts/*.js', series('scripts'));

task('default', series('clean', parallel('copy:html', 'styles', 'icons', 'img', 'scripts'), 'server'));