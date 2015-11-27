module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: {
                src: ["src/build", "dist", "src/closure/*.js", "!src/closure/closure.js"]
            }
        },
        karma: {
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
                dest: 'src/build/ukulele.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/ukulele.js',
                dest: 'dist/ukulele.min.js'
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
                evil:true,
                globals: {
                    jQuery: true
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: 'src/build/*',
                        dest: 'src/closure/',
                        flatten: true
        			}
        		]
            }
        },
        jsdoc: {
            dist: {
                jsdoc: 'node_modules/.bin/jsdoc',
                src: ['src/ukulele/*/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        include_file: {
            default_options: {
                cwd: 'src/closure/',
                src: ['closure.js'],
                dest: 'dist/'
            }
        },
        rename: {
            main: {
                files: [
                    {
                        src: ['dist/closure.js'],
                        dest: 'dist/ukulele.js'
                    },
        ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-include-file');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'uglify']);
    grunt.registerTask('build', ['jshint', 'karma']);
    grunt.registerTask('test' , ['jshint','karma']);
    grunt.registerTask('release', ['clean', 'jshint', 'karma', 'concat', 'copy', 'include_file', 'rename', 'uglify', 'jsdoc']);
    grunt.registerTask('release2', ['clean', 'jshint', 'concat', 'copy', 'include_file', 'rename', 'uglify']);
    /*grunt.registerTask('copyjs', ['copy']);
    grunt.registerTask('closure', ['include_file']);
    grunt.registerTask('cleanAll', ['clean']);*/
    grunt.registerTask('cleanAll', ['clean']);
};
