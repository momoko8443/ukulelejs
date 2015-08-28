var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
gulp.task('js',function(){
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        //.pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

gulp.task('css',function(){
    return gulp.src('resources/css/*.css')
        .pipe(gulp.dest('build/css'));
});

gulp.task('default',['js','css']);