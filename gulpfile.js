const gulp = require("gulp");
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const minifyCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const uglify = require('gulp-uglify-es').default;

const debug = false;

gulp.task("minifyJS", function () {
    return gulp.src(["js/*.js", "!js/*.min.js"])
        .pipe(terser())
        /*.pipe(function () {
            //uglify();
            //terser();
        })*/.pipe(rename(function (path) {
            path.extname = '.min.js'
        })).pipe(gulp.dest("js"));
});

gulp.task("sass", function () {
    return gulp.src("scss/*.scss")
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(rename(function (path) {
            path.extname = '.min.css';
        })).pipe(gulp.dest('css'));
});

gulp.task('minifyCSS', function () {
    return gulp.src(["css/*.css", "!css/*.min.css"])
        .pipe(minifyCSS())
        .pipe(rename(function (path) {
            path.extname = '.min.css';
        })).pipe(gulp.dest('css'));
})

gulp.task('default', gulp.parallel('minifyJS', 'minifyCSS', 'sass'));