module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        exec: {
            tsc: './node_modules/typescript/bin/tsc',
            mocha: './node_modules/mocha/bin/mocha'
        },
        tslint: {
            options: {
                rulesDirectory: 'node_modules/tslint-microsoft-contrib',
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: {
                src: ['src/*.ts']
            }
        },
        clean: {
            build: ['lib']
        },
        watch: {
            scripts: {
                files: ['src/*.ts'],
                tasks: ['build']
            }
        }
    });
    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('build', ['tslint', 'exec'])
    grunt.registerTask('default', ['build']);
  };