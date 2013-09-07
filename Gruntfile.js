module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n',
                    report: 'gzip',
                    sourceMapRoot: './',
                    sourceMap: '<%= pkg.name %>.min.map',
                    sourceMapUrl: '<%= pkg.name %>.min.map'
                },
                files: {
                    '<%= pkg.name %>.min.js': ['<%= pkg.name %>.js'],
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                // '-a' for all files
                commitFiles: [
                    // Hack to ensure that our bump commit works.
                    '--no-verify',
                    // Actual files to change.
                    'package.json', 'bower.json',
                    'mocha.events.js', 'mocha.events.min.js', 'mocha.events.min.map'
                ],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                // options to use with '$ git describe'
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        jshint: {
            all:['mocha.events.js'],
            options: {
                bitwise: true,
                browser: true,
                browser: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                jquery: true,
                latedef: true,
                newcap: true,
                noarg: true,
                node: true,
                nonew: true,
                plusplus: true,
                regexp: true,
                trailing: true,
                undef: true,
                globals: {
                    define: true,
                    require: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.renameTask('bump', 'nonBuildBump');
    grunt.registerTask('bump', ['default', 'nonBuildBump']);
};
