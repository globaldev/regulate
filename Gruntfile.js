module.exports = function (grunt) {

    "use strict";

    grunt.initConfig({
        jshint: {
            options: {
                node: true,
                es5: true,
                "-W032": true // Tolerate leading semicolon
            },
            files: [
                "lib/**/*.js",
                "Gruntfile.js"
            ]
        },
        simplemocha: {
            all: {
                src: "test/**/*.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-simple-mocha");

    grunt.registerTask("default", [
        "jshint",
        "simplemocha"
    ]);

};