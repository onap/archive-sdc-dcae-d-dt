// Generated on 2016-05-30 using generator-angular 0.15.1
'use strict';

// # Globbing for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js' use this if you want to recursively match all
// subfolders: 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        cdnify: 'grunt-google-cdn',
        ngconstant: 'grunt-ng-constant',
        mkdir: 'grunt-mkdir',
        preprocess: 'grunt-preprocess'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        tmp: {
            exploded: '.tmp',
            imploded: '.tmp_imploded'
        },
        dist: {
            exploded: 'dist/exploded',
            imploded: 'dist/imploded',
            war: 'dist/war'
        }
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/main/{,*/}*.js'],
                tasks: [
                    'newer:jshint:all', 'newer:jscs:all'
                ],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            injector: {
                files: [
                    'app/styles/*.less', 'app/core/**/*.less', 'app/main/**/*.less'
                ],
                taskd: ['injector']
            },
            less: {
                files: ['app/**/*.less'],
                tasks: ['less:development'],
                options: {
                    nospawn: true
                }
            },
            styles: {
                files: ['<%= yeoman.app %>/main/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'postcss']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            options: {
                livereload: true
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: ['<%= yeoman.app %>/{,*/}*.html', '<%= yeoman.app %>/styles/app.css', '<%= yeoman.app %>/styles/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}']
            }
        },

        /*
        concat: {
           options: {
               stripBanners: true
           },
           exploded: {
               dest: '<%= yeoman.tmp.exploded %>'
           }
        },
        */

        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '"use strict";\n\n {\%= __ngModule %}',
                name: 'dcaeApp.env'
            },
            // Environment targets
            dev: {
                options: {
                    dest: '<%= yeoman.app %>/app.env.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        apiBase: 'http://localhost:8080/',
                        host: 'http://localhost:8446/',
                        catalogImport: '/comp-fe/',
                        catalogPrefix: 'http://localhost:8446',
                        cookieUser: 'ym903w',
                        ruleEditorUrl: 'http://localhost:4200'
                    }
                }
            },
            exploded: {
                options: {
                    dest: '<%= yeoman.app %>/app.env.js'
                },
                constants: {
                    ENV: {
                        name: 'production',
                        apiBase: '/dcae/dcaeProxyOld/',
                        host: '/dcae/dcaeProxyOld/',
                        catalogImport: '/dcae/comp-fe/',
                        catalogPrefix: '/dcae/dcaeProxyOld/',
                        cookieUser: 'le056g',
                        ruleEditorUrl: '/rule_engine'
                    }
                }
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: true
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            //connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect().use('/app/styles', connect.static('./app/styles')),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            connect.static('<%= yeoman.tmp.exploded %>'),
                            connect.static('test'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            exploded: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist.exploded %>'
                }
            }
        },

        // app.less contains all the less from all places, convert it to CSS
        less: {
            development: {
                files: {
                    'app/styles/app.css': 'app/styles/app.less'
                }
            },
            production: {
                files: {
                    '<%= yeoman.tmp.exploded %>/styles/app.css': 'app/styles/app.less'
                }
            }
        },

        injector: {
            options: {},
            // Inject all project less into app.less
            less: {
                options: {
                    transform: function (filePath) {
                        filePath = filePath.replace('/app/styles/', '../styles/');
                        filePath = filePath.replace('/app/main/', '../main/');
                        filePath = filePath.replace('/app/core/', '../core/');
                        return '@import \'' + filePath + '\';';
                    },
                    starttag: '// injector:less',
                    endtag: '// endinjector:less'
                },
                files: {
                    'app/styles/app.less': ['app/styles/*.less', 'app/core/**/*.less', 'app/main/**/*.less', '!app/styles/app.less']
                }
            }
        },

        // Make sure there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: ['Gruntfile.js', '<%= yeoman.app %>/main/{,*/}*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Make sure code styles are up to par
        jscs: {
            options: {
                config: '.jscsrc',
                verbose: true
            },
            all: {
                src: ['Gruntfile.js', '<%= yeoman.app %>/main/{,*/}*.js']
            },
            test: {
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            exploded: {
                files: [
                    {
                        dot: true,
                        src: ['<%= yeoman.tmp.exploded %>', '<%= yeoman.dist.exploded %>/{,*/}*', '!<%= yeoman.dist.exploded %>/.git{,*/}*']
                    }
                ]
            },
            imploded: {
                files: [
                    {
                        dot: true,
                        src: ['<%= yeoman.dist.imploded %>']
                    }
                ]
            },
            html: {
                files: [
                    {
                        dot: true,
                        src: ['<%= yeoman.dist.exploded %>/index.html']
                    }
                ]
            },
            server: '<%= yeoman.tmp.exploded %>'
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                processors: [require('autoprefixer-core')({browsers: ['last 1 version']})]
            },
            server: {
                options: {
                    map: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.tmp.exploded %>/styles/',
                        src: '{,*/}*.css',
                        dest: '<%= yeoman.tmp.exploded %>/styles/'
                    }
                ]
            },
            exploded: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.tmp.exploded %>/styles/',
                        src: '{,*/}*.css',
                        dest: '<%= yeoman.tmp.exploded %>/styles/'
                    }
                ]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath: /\.\.\//
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            exploded: {
                src: ['<%= yeoman.dist.exploded %>/scripts/{,*/}*.js', '<%= yeoman.dist.exploded %>/styles/{,*/}*.css', '<%= yeoman.dist.exploded %>/styles/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}', '<%= yeoman.dist.exploded %>/styles/fonts/*']
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist.exploded %>',
                flow: {
                    html: {
                        steps: {
                            js: [
                                'concat', 'uglifyjs'
                            ],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist.exploded %>/{,*/}*.html'],
            css: ['<%= yeoman.dist.exploded %>/styles/{,*/}*.css'],
            js: ['<%= yeoman.dist.exploded %>/scripts/{,*/}*.js'],
            options: {
                assetsDirs: [
                    '<%= yeoman.dist.exploded %>', '<%= yeoman.dist.exploded %>/styles/images', '<%= yeoman.dist.exploded %>/styles'
                ],
                patterns: {
                    js: [
                        [/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']
                    ]
                }
            }
        },

        imagemin: {
            exploded: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist.exploded %>/styles/images'
                    }
                ]
            }
        },

        svgmin: {
            exploded: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/styles/images',
                        src: '{,*/}*.svg',
                        dest: '<%= yeoman.dist.exploded %>/styles/images'
                    }
                ]
            }
        },

        htmlmin: {
            exploded: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist.exploded %>',
                        src: ['*.html'],
                        dest: '<%= yeoman.dist.exploded %>'
                    }
                ]
            }
        },

        ngtemplates: {
            exploded: {
                options: {
                    module: 'dcaeApp',
                    htmlmin: '<%= htmlmin.exploded.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= yeoman.app %>',
                src: [
                    'main/**/*.html', 'core/**/*.html', 'comp-fe/**/*.html'
                ],
                dest: '<%= yeoman.tmp.exploded %>/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection.
        ngAnnotate: {
            exploded: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.tmp.exploded %>/concat/scripts',
                        src: '*.js',
                        dest: '<%= yeoman.tmp.exploded %>/concat/scripts'
                    }
                ]
            }
        },

        // Replace Google CDN references
        cdnify: {
            exploded: {
                html: ['<%= yeoman.dist.exploded %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            exploded: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist.exploded %>',
                        src: ['*.{ico,png,txt}', '*.html', 'styles/images/{,*/}*.{webp}', 'styles/fonts/{,*/}*.*']
                    }, {
                        expand: true,
                        cwd: '<%= yeoman.tmp.exploded %>/images',
                        dest: '<%= yeoman.dist.exploded %>/styles/images',
                        src: ['generated/*']
                    }, {
                        expand: true,
                        cwd: 'bower_components/bootstrap/dist',
                        src: 'fonts/*',
                        dest: '<%= yeoman.dist.exploded %>'
                    }, {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: ['WEB-INF/*'],
                        dest: '<%= yeoman.dist.exploded %>/'
                    }, {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: ['dcae.xml'],
                        dest: '<%= yeoman.dist.exploded %>/'
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '<%= yeoman.tmp.exploded %>/styles/',
                src: '{,*/}*.css'
            },
            tmpImploded: {
                expand: true,
                cwd: '<%= yeoman.dist.exploded %>',
                dest: '<%= yeoman.tmp.imploded %>',
                src: '**/*'
            },
            copyComposition: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist.imploded %>',
                src: 'comp-fe/**/*'
            },
            copyProject: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist.exploded %>',
                src: ['**/*']
            },
            copyIndex: {
                expand: true,
                cwd: '<%= yeoman.app %>/prodHtml',
                dest: '<%= yeoman.dist.exploded %>',
                src: ['**/*']
            },
            copyComposition2: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist.exploded %>',
                src: 'comp-fe/**/*'
            },
            imploded: {
                expand: true,
                cwd: '<%= yeoman.dist.exploded %>',
                dest: '<%= yeoman.dist.imploded %>',
                src: ['dcae.xml', 'WEB-INF/**']
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less:development', 'copy:styles'
            ],
            test: ['copy:styles'],
            exploded: [
                'less:production', 'copy:styles', 'imagemin', 'svgmin'
            ],
            style: ['less:production']
        },

        mkdir: {
            all: {
                options: {
                    create: ['<%= yeoman.dist.exploded %>/WEB-INF']
                }
            },
            dist: {
                options: {
                    create: ['<%= yeoman.dist %>']
                }
            },
            imploded: {
                options: {
                    create: ['<%= yeoman.dist.imploded %>', '<%= yeoman.tmp.imploded %>']
                }
            }
        },

        preprocess: {
            options: {
                inline: true,
                context: {
                    DEBUG: false
                }
            },
            /*html : {
                src : [
                    '<%= yeoman.dist %>/index.html',
                    '<%= yeoman.dist %>/views/*.html'
                ]
            },*/
            js: {
                src: '<%= yeoman.tmp.exploded %>/concat/scripts/*.js'
            }
        }

    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt
                .task
                .run(['build', 'connect:exploded:keepalive']);
        }

        grunt
            .task
            .run([
                'clean:server', // Delete .tmp folder
                'ngconstant:dev', // Configure constants
                'wiredep', // Automatically inject Bower components into the app
                'injector', // Inject the less files to app.less
                'concurrent:server', // Run some tasks in parallel to speed up the build process, need to see what the task run.
                'postcss:server', // Add vendor prefixed styles
                'connect:livereload',
                'watch'
            ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt
            .log
            .warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt
            .task
            .run(['serve:' + target]);
    });

    grunt.registerTask('test', ['clean:server', 'wiredep', 'concurrent:test', 'postcss', 'connect:test']);

    grunt.registerTask('build', [
        'clean:exploded',
        'ngconstant:exploded',
        'wiredep',
        'injector',
        'concurrent:exploded',
        'useminPrepare',
        'postcss',
        'ngtemplates',
        'concat',
        'preprocess:js',
        'ngAnnotate',
        //'mkdir',
        'copy:exploded',
        //'cdnify',
        'cssmin',
        'uglify',
        'mkdir:imploded',
        'clean:imploded',
        'copy:tmpImploded', // Copy the files before changing their names
        'copy:imploded', // Copy the WEB-INF folder and dcae.xml
        'filerev', // This will change the name of the files for caching.
        'usemin',
        'copy:copyComposition'
        //'htmlmin'
    ]);

    grunt.registerTask('build2', [
        'clean:exploded',
        'ngconstant:exploded',
        'wiredep',
        'injector',
        'concurrent:style',
        'postcss',
        // 'useminPrepare', 'postcss', 'ngtemplates', 'concat', 'preprocess:js',
        // 'ngAnnotate', 'mkdir',
        'copy:copyProject',
        'clean:html',
        'copy:copyIndex'
    ]);

    grunt.registerTask('default', ['newer:jshint', 'newer:jscs', 'test', 'build']);
};
