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

    // TODO: Improve this because it currently runs a huge number of individual tests
    describe("ranges", function () {

        var data = new Array(1001).join(" ").split(" "),
            ranges = [
                [0, 10],
                [1, 10],
                [1, 99],
                [1, 100],
                [50, 500],
                [99, 100],
                [1, 1000],
                [0, 1000],
                [46, 243]
            ];

        ranges.forEach(function (range) {
            var rx = regulate().start().range([range[0], range[1]]).end().toRegExp();
            data.forEach(function (e, i) {
                it("should generate a regexp for the range " + range[0] + "-" + range[1], function () {
                    var result = rx.test(i);
                    if (range[0] <= i && range[1] >= i) {
                        result.should.equal(true);
                    } else {
                        result.should.equal(false);
                    }
                });
            });
        });

    });

    describe("word boundaries", function () {

        it("should generate regexps including word boundaries", function () {
            var rx = regulate().wordBoundary().string("word").wordBoundary();
            rx.toString().should.equal("\\bword\\b");
            rx.toRegExp().test("string with word in it").should.equal(true);
            rx.toRegExp().test("not in this string").should.equal(false);
        });

        it("should generate regexps including negated word boundaries", function () {
            var rx = regulate().wordBoundary(true).string("word");
            rx.toString().should.equal("\\Bword");
            rx.toRegExp().test("string with sword in it").should.equal(true);
            rx.toRegExp().test("string with word in it").should.equal(false);
        });

    });

}());