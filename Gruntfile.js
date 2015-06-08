module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version%> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dist: {
                src: ['ukulele/*/*.js'],
                dest: 'build/js/all.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/js/all.js',
                dest: 'build/js/all.min.js'
            }
        },
        jshint: {
            // define the files to lint
            files: ['ukulele/*/*.js'],
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
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};