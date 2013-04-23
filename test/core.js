(function () {

    "use strict";

    var should = require("should"),
        regulate = require("../lib/Regulate");

    describe("conversion", function () {

        it("should return a string", function () {
            var rx = regulate().toString();
            rx.should.be.a("string");
        });

        it("should return a RegExp instance", function () {
            var rx = regulate().toRegExp();
            rx.should.be.an.instanceOf(RegExp);
        });

    });

    describe("strings", function () {

        it("should generate regexps for single characters", function () {
            var rx = regulate().string("a").toString();
            rx.should.equal("a");
        });

        it("should generate regexps for simple strings", function () {
            var rx = regulate().string("abc").toString();
            rx.should.equal("abc");
        });

        it("should generate regexps for spaces", function () {
            var rx = regulate().string("   ").toString();
            rx.should.equal("   ");
        });

        it("should escape characters with special meanings", function () {
            var rx = regulate().string("[]()\\^$.|?*+").toString();
            rx.should.equal("\\[\\]\\(\\)\\\\\\^\\$\\.\\|\\?\\*\\+");
        });

        it("should chain simple strings together", function () {
            var rx = regulate().string("ab").string("cd").toString();
            rx.should.equal("abcd");
        });

    });

    describe("anchors", function () {

        it("should generate regexps anchored to the start of a string", function () {
            var rx = regulate().start().string("abc").toString();
            rx.should.equal("^abc");
        });

        it("should generate regexps anchored to the end of a string", function () {
            var rx = regulate().string("abc").end().toString();
            rx.should.equal("abc$");
        });

        it("should generate regexps anchored to the start and end of a string", function () {
            var rx = regulate().start().string("abc").end().toString();
            rx.should.equal("^abc$");
        });

    });

    describe("dot", function () {

        it("should generate regexps to match any character except line breaks", function () {
            var rx = regulate().anything().toString();
            rx.should.equal(".");
        });

        it("should generate regexps to match any character including line breaks", function () {
            var rx = regulate().anything(true).toString();
            rx.should.equal("[\\s\\S]");
        });

    });

    describe("character classes", function () {

        it("should generate regexps to match one character out of many", function () {
            var rx = regulate().charIn("a", "b", "c").toString();
            rx.should.equal("[abc]");
        });

        it("should generate regexps to match one character that is not in a list", function () {
            var rx = regulate().charNotIn("a", "b", "c").toString();
            rx.should.equal("[^abc]");
        });

        it("should appropriately escape characters in classes", function () {
            var rx = regulate().charIn("]", "^", "-", "\\").toString();
            rx.should.equal("[\\]\\^\\-\\\\]");
        });

    });

}());