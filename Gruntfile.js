module.exports = function (grunt) {

    "use strict";

    grunt.initConfig({
        jshint: {
            options: {
                node: true,
                es5: true,
                "-W032": true, // Tolerate leading semicolon
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                latedef: true,
                quotmark: "double",
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                globals: {
                    define: true
                }
            },
            files: [
                "lib/**/*.js",
                "Gruntfile.js"
            ]
        },
        uglify: {
            dist: {
                files: {
                    "build/Regulate.min.js": ["lib/Regulate.js"]
                }
            }
        },
        simplemocha: {
            all: {
                src: "test/**/*.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-simple-mocha");

    grunt.registerTask("default", [
        "jshint",
        "simplemocha",
        "uglify"
    ]);

};