module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma:{
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version%> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dist: {
                src: ['src/ukulele/*/*.js'],
                dest: 'build/js/ukulele.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/js/ukulele.js',
                dest: 'build/js/ukulele.min.js'
            }
        },
        jshint: {
            // define the files to lint
            files: ['src/ukulele/*/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify']);
};