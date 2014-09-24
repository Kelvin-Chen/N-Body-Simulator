module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            build: {
                src: 'src/*.ts',
                dest: 'build/app.js',
                options: {
                    basePath: './',
                    module: 'amd',
                    target: 'es5'
                }
            }
        },
        jade: {
            build: {
                files: { 'build/index.html': 'index.jade' }
            }
        },
        concurrent: {
            build: ['jade:build', 'typescript:build']
        },
        watch: {
            options: {
                interrupt: true
            },
            scripts: {
                files: 'src/*.ts',
                tasks: 'typescript:build'
            },
            jade: {
                files: 'index.jade',
                tasks: 'jade:build'
            }
        },
        'gh-pages': {
            options: {
                base: 'build',
            },
            createPage: {
                src: '*'
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('build', ['concurrent:build']);
    grunt.registerTask('publish', ['concurrent:build', 'gh-pages']);
    grunt.registerTask('dev', ['concurrent:build', 'watch']);
};
