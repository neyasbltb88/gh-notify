const gulp = require('gulp'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
    return browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false,
        open: false,
        reloadOnRestart: true
    });
});

gulp.task('js', function() {
    return gulp.src([
            'src/js/gh-notify.js',
            'src/js/common.js',
        ])
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('sass', function() {
    return gulp.src('src/sass/**/*.sass')
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
    gulp.watch(['src/js/**/*.js', '!src/js/**/*.min.js'], ['js']);
    gulp.watch('src/sass/**/*.sass', ['sass']);
    gulp.watch('src/**/*.html', browserSync.reload);
});


gulp.task('build', ['sass', 'js'], function() {
    var buildCss = gulp.src([
            'src/css/gh-notify.min.css',
        ])
        .pipe(gulp.dest('build/'));
    var buildJs = gulp.src([
            'src/js/gh-notify.min.js'
        ])
        .pipe(gulp.dest('build/'));
});


gulp.task('default', ['watch']);