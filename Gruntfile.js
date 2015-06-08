module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat:{
            options:{
                stripBanners:true,
                banner:'/*! <%= pkg.name %> - v<%= pkg.version%> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            dist:{
                src:['ukulele/*/*.js'],
                dest:'build/js/all.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['concat']);
};