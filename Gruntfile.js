module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        exec: {
            tsc: './node_modules/typescript/bin/tsc',
            mocha: './node_modules/mocha/bin/mocha --grep Stress --invert',
            stress: './node_modules/mocha/bin/mocha --grep Stress',
            lint: 'yarn eslint . --ext .ts'
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

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('build', ['exec:lint', 'exec:tsc', 'exec:mocha']);
    grunt.registerTask('stress', ['exec:lint', 'exec:tsc', 'exec:stress']);
    grunt.registerTask('quick', ['exec:tsc']);
    grunt.registerTask('full', ['exec:lint', 'exec']);
    grunt.registerTask('default', ['build']);
  };
