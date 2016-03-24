var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var jsdoc = require('gulp-jsdoc');
var karma = require('karma');
var include = require('gulp-include');
var sequence = require('gulp-sequence');
var rename = require('gulp-rename');

gulp.task('clean', function(){
    return gulp.src(['doc',
                     'dist/*',
                     'src/closure/*.js',
                     '!src/closure/closure.js'])
                .pipe(clean({force: true}));

});

gulp.task('clean2',['uglify'],function(){
    return gulp.src(['dist/*.js',
                     '!dist/ukulele.js',
                     '!dist/ukulele.min.js',
                     'src/closure/*.js',
                     '!src/closure/closure.js'])
                .pipe(clean({force: true}));
});

gulp.task('concat', ['clean'],function(){
    return gulp.src("src/ukulele/*/*.js")
               .pipe(concat('ukulele.js'))
               .pipe(gulp.dest('src/closure/'));
});

gulp.task('uglify', ['rename'],function(){
    return gulp.src('dist/ukulele.js')
               .pipe(uglify())
               .pipe(rename('ukulele.min.js'))
               .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function(){
    return gulp.src(['src/ukulele/*/*.js'])
               .pipe(jshint({
                        curly: true,
                        eqeqeq: true,
                        eqnull: true,
                        browser: true,
                        evil:true,
                        globals: {
                            jQuery: true
                        }
                    }))
               .pipe(jshint.reporter('default'));
});


gulp.task('jsdoc', function(){
    return gulp.src('src/ukulele/*/*.js')
               .pipe(jsdoc('doc'));
});

gulp.task('test', function(done){
    var Server = karma.Server;
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    },done).start();
});

gulp.task('include', ['concat'],function(){
    return gulp.src('src/closure/closure.js')
                .pipe(include())
                .pipe(gulp.dest('dist/'))
                .on('error', console.log);
});

gulp.task('rename', ['include'],function(){
    return gulp.src('dist/closure.js')
               .pipe(rename('ukulele.js'))
               .pipe(gulp.dest('dist/'));
});

gulp.task('production', sequence('package','jsdoc'));
gulp.task('package',sequence('jshint','test','clean2'));
