var gulp = require('gulp');
var karma = require('karma');
var connect = require('gulp-connect');
var webpack = require('gulp-webpack');
var sequence = require('gulp-sequence');

gulp.task('webpack',  function () {
	return gulp.src('src/core/Ukulele.ts')
		.pipe(webpack( require('./webpack.config.js')))
        .pipe(gulp.dest('dist/'))
        .pipe(gulp.dest('../ukulelejs_website/bower_components/ukulelejs/dist/'));
});

gulp.task('test', function(done){
    var Server = karma.Server;
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    },done).start();
});

gulp.task('package',sequence('test','webpack'));

gulp.task('connect',['package'],function () {
  connect.server({
    root: './',
    livereload: true
  });
});