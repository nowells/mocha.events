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
        requirejs: {
            build: {
                options: {
                    baseUrl: './',
                    out: 'mocha.events.js',
                    name: 'mocha_events',
                    mainConfigFile: 'build.js',
                    optimize: "none",
                    exclude: ['jquery', 'underscore', 'json3', 'handlebars', 'jquery.cookie', 'hbs'],
                    done: function(done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:')
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        done();
                    }
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
            all:['src/**/*.js'],
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
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bump');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'requirejs', 'uglify']);
    grunt.renameTask('bump', 'nonBuildBump');
    grunt.registerTask('bump', ['default', 'nonBuildBump']);
};
