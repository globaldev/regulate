/**
 * class Regulate
 *
 * A set of methods for building regular expressions simply and semantically
 */

;(function (window) {

    "use strict";

    //////
    // Global object stuff, borrowed from Lo-Dash
    /////
    var freeExports = typeof exports === "object" && exports,
        freeModule = typeof module === "object" && module && module.exports === freeExports && module,
        freeGlobal = typeof global === "object" && global;

    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        window = freeGlobal;
    }

    /////
    // Utils
    /////

    function regexpEscape(str) {
        return str.replace(/([\^$\\?\[\]*+.\(\)|])/g, "\\$1");
    }

    function regexpClassEscape(str) {
        return str.replace(/([\^\\\]-])/g, "\\$1");
    }

    function padRight(str, length, pad) {
        if (str.length < length) {
            return new Array(length - str.length + 1).join(pad) + str;
        }
        return str;
    }

    function fixPair(pair) {
        var s = pair[0] + "",
            e = pair[1] + "";
        return [padRight(s, e.length, "0"), e];
    }

    function breakpointToString(breakpoint) {
        return fixPair([breakpoint + "", (breakpoint + 1) + ""]);
    }

    function breakRanges1(start, end) {
        var breakpoint;
        start = start + "";
        end = end + "";
        if (start.length === end.length) {
            return [
                [start, end]
            ];
        }
        breakpoint = Math.pow(10, start.length) - 1;
        return [
            [start, breakpoint + ""]
        ].concat(breakRanges(breakpoint + 1, end));
    }

    function breakRanges2(start, end) {
        var breakpoint,
            breakdigit,
            digit,
            b2,
            a = [];
        if (start.length === 1) {
            return [
                [start, end]
            ];
        }
        if (new Array(start.length + 1).join("0") === "0" + start.substring(1)) {
            if (new Array(end.length + 1).join("9") === "9" + end.substring(1)) {
                return [
                    [start, end]
                ];
            }
            if (+start[0] < +end[0]) {
                breakpoint = breakpointToString(parseInt(end[0] + (new Array(end.length).join("0")), 10) - 1);
                return [
                    [start, breakpoint[0]]
                ].concat(breakRanges2(breakpoint[1], end));
            }
        }
        if (new Array(start.length + 1).join("9") === "9" + end.substring(1)) {
            if (+start[0] < +end[0]) {
                breakdigit = (1 + (+start[0])) + "";
                breakpoint = breakpointToString(parseInt(breakdigit + (new Array(end.length).join("0")), 10) - 1);
                return breakRanges2(start, breakpoint[0]).concat([
                    [breakpoint[1], end]
                ]);
            }
        }
        if (+start[0] < +end[0]) {
            breakdigit = (1 + (+start[0])) + "";
            breakpoint = breakpointToString(parseInt(breakdigit + (new Array(end.length).join("0")), 10) - 1);
            return breakRanges2(start, breakpoint[0]).concat(breakRanges2(breakpoint[1], end));
        }
        digit = start[0];
        b2 = breakRanges2(start.substring(1), end.substring(1));
        b2.forEach(function (i) {
            a.push([digit + i[0], digit + i[1]]);
        });
        return a;
    }

    function breakRanges(start, end) {
        var b = [],
            b1 = [];
        breakRanges1(start, end).forEach(function (t) {
            b1.push(t);
            b = b.concat(breakRanges2(t[0], t[1]));
        });
        return b;
    }

    function shrinkRangeRegex(rx, max) {
        var i;
        for (i = max; i > 1; i--) {
            rx = rx.replace(new Array(i + 1).join("[0-9]"), "[0-9]{" + i + "}");
        }
        return rx;
    }

    function computeRegexForRange(start, end) {
        var rx = "", i;
        for (i = 0; i < start.length; i++) {
            if (start[i] === end[i]) {
                rx += start[i];
            } else if (+start[i] + 1 === +end[i]) {
                rx += "[" + start[i] + end[i] + "]";
            } else {
                rx += "[" + start[i] + "-" + end[i] + "]";
            }
        }
        return shrinkRangeRegex(rx, end.length);
    }

    function rangesToRegexes(ranges) {
        var rxs = [];
        ranges.forEach(function (range) {
            rxs.push(computeRegexForRange(range[0], range[1]));
        });
        return rxs;
    }

    function rangeToRegexes(start, end) {
        var temp;
        start = +start;
        end = +end;
        if (start > end) {
            temp = start;
            start = end;
            end = temp;
        }
        return rangesToRegexes(breakRanges(start + "", end + ""));
    }

    function collapsePowers(rxs) {
        var rxs2 = [],
            power10start = -1,
            power10end = -1,
            startsWith0 = false,
            newRx,
            n;
        rxs = rxs.slice();
        rxs.push("");
        rxs.forEach(function (rx) {
            if (rx === "[0-9]") {
                power10start = 0;
                power10end = 0;
                startsWith0 = true;
                rx = "";
            } else if (rx === "[1-9]") {
                power10start = 0;
                power10end = 0;
                rx = "";
            } else if (rx === "[1-9][0-9]") {
                if (power10start < 0) {
                    power10start = 1;
                }
                power10end = 1;
                rx = "";
            } else if (rx.indexOf("[1-9][0-9]{") === 0) {
                n = parseInt(rx.substring("[1-9][0-9]{".length, rx.length - 1), 10);
                if (power10start < 0) {
                    power10start = n;
                }
                power10end = n;
                rx = "";
            } else if (power10start >= 0) {
                if (startsWith0) {
                    newRx = "[0-9]";
                    if (power10end >= 1) {
                        newRx += "{1," + (power10end + 1) + "}";
                    }
                } else {
                    newRx = "[1-9]";
                    if (power10end >= 1) {
                        newRx += "[0-9]";
                    }
                    if (power10start === 0 && power10end === 1) {
                        newRx += "?";
                    } else if (power10start === power10end && power10start > 1) {
                        newRx += "{" + power10start + "}";
                    } else if (power10start < power10end) {
                        newRx += "{" + power10start + "," + power10end + "}";
                    }
                }
                power10start = -1;
                power10end = -1;
                rxs2.push(newRx);
            }
            if (rx) {
                rxs2.push(rx);
            }
        });
        return rxs2;
    }

    function getType(obj) {
        var type = Object.prototype.toString.call(obj);
        if (type === "[object Object]") {
            if (!obj) {
                return obj === undefined ? "undefined" : "null";
            }
        }
        return type.substring(8, type.length - 1).toLowerCase();
    }

    /////
    // Regulate
    /////

    // Private constructor
    function Regulate() {
        this._output = "";
    }

    /**
     * Regulate#toString() => {String}
     *
     * Converts the current regular expression into a string
     */
    Regulate.prototype.toString = function () {
        return this._output;
    };

    /**
     * Regulate#toRegExp() => {RegExp}
     *
     * Converts the current regular expression into a RegExp object
     */
    Regulate.prototype.toRegExp = function () {
        return new RegExp(this._output);
    };

    /**
     * Regulate#start() => {Regulate}
     *
     * Adds an start-of-string anchor to the current regular expression
     */
    Regulate.prototype.start = function () {
        this._output += "^";
        return this;
    };

    /**
     * Regulate#end() => {Regulate}
     *
     * Adds an end-of-string anchor to the current regular expression
     */
    Regulate.prototype.end = function () {
        this._output += "$";
        return this;
    };

    /**
     * Regulate#string(str) => {Regulate}
     *
     * Adds a simple string to the current regular expression
     *
     * Arguments:
     *   str    {String}    The string to add
     */
    Regulate.prototype.string = function (str) {
        this._output += regexpEscape(str);
        return this;
    };

    /**
     * Regulate#anything([linebreaks]) => {Regulate}
     *
     * Adds an 'anything' metacharacter to the current regular expression
     *
     * Arguments:
     *   [linebreaks]    {Boolean}    If true the added metacharacter will also match line break characters
     */
    Regulate.prototype.anything = function (linebreaks) {
        if (linebreaks) {
            return this.charIn("\\s\\S");
        }
        this._output += ".";
        return this;
    };

    /**
     * Regulate#group(content[, nonCapturing]) => {Regulate}
     *
     * Adds a group containing the specified content to the current regular expression
     *
     * Arguments:
     *   content           {String | Regulate}    The contents of the group
     *   [nonCapturing]    {Boolean}              If true the group will be non-capturing
     */
    Regulate.prototype.group = function (content, nonCapturing) {
        this._output += "(";
        if (nonCapturing) {
            this._output += "?:";
        }
        if (content instanceof Regulate) {
            this._output += content.toString();
        } else {
            this._output += content;
        }
        this._output += ")";
        return this;
    };

    /**
     * Regulate#charIn([negated]) => {Regulate}
     *
     * Adds a character class to the current regular expression
     *
     * Arguments:
     *   [negated]    {Boolean}    If true this method will add a negated character class to the regular expression
     */
    Regulate.prototype.charIn = function (negated) {
        var chars,
            i;
        negated = typeof negated === "boolean";
        chars = [].slice.call(arguments, negated ? 1 : 0);
        this._output += "[";
        if (negated) {
            this._output += "^";
        }
        for (i = 0; i < chars.length; i++) {
            if (chars[i].length === 1) {
                this._output += regexpClassEscape(chars[i]);
            } else {
                this._output += chars[i]; // Allow escape sequences in character classes e.g. `[\s]`
            }
        }
        this._output += "]";
        return this;
    };

    /**
     * Regulate#charNotIn() => {Regulate}
     *
     * Adds a negated character class to the current regular expression
     */
    Regulate.prototype.charNotIn = function () {
        return this.charIn.apply(this, [true].concat([].slice.call(arguments)));
    };

    /**
     * Regulate#repeat(min[, max]) => {Regulate}
     *
     * Makes the previous character/group of the current regular expression repeatable
     *
     * Arguments:
     *   min      {Number}    The minimum number of repetitions. Less than 0 signifies infinite repetions (including absence)
     *   [max]    {Number}    The maximum number of repetitions. 0 indicates no upper bound
     *
     * Example:
     *  regulate().string("a").repeat(-1).toString()      => "a*"
     *  regulate().string("a").repeat(1, 0).toString()    => "a+"
     *  regulate().string("a").repeat(3).toString()       => "a{3}"
     *  regulate().string("a").repeat(1, 5).toString()    => "a{1,5}"
     *  regulate().string("a").repeat(4, 0).toString()    => "a{4,}"
     */
    Regulate.prototype.repeat = function (min, max) {
        if (min < 0) {
            this._output += "*";
            if (max === false) {
                this._output += "?"; // Non-greedy
            }
        } else if (min === 1 && (max <= 0 || max === false)) {
            this._output += "+";
            if (max === false) {
                this._output += "?";
            }
        } else {
            this._output += "{" + min;
            if (max !== undefined) {
                this._output += ",";
            }
            if (max > 0) {
                this._output += max;
            }
            this._output += "}";
        }
        return this;
    };

    /**
     * Regulate#optional() => {Regulate}
     *
     * Makes the previous character/group of the current regular expression optional
     */
    Regulate.prototype.optional = function () {
        this._output += "?";
        return this;
    };

    /**
     * Regulate#followedBy(content[, negated]) => {Regulate}
     *
     * Adds a lookahead to the current regular expression
     *
     * Arguments:
     *   content      {String | Regulate}    The contents of the lookahead
     *   [negated]    {Boolean}              If true this method will create a negative lookahead
     */
    Regulate.prototype.followedBy = function (content, negated) {
        this._output += "(?" + negated ? "!" : "=";
        this._output += content instanceof Regulate ? content.toString() : content;
        this._output += ")";
        return this;
    };

    /**
     * Regulate#notFollowedBy(content) => {Regulate}
     *
     * Adds a negative lookahead to the current regular expression
     *
     * Arguments:
     *   content    {String | Regulate}    The contents of the negative lookahead
     */
    Regulate.prototype.notFollowedBy = function (content) {
        return this.followedBy(content, true);
    };

    /**
     * Regulate#wordBoundary([negated]) => {Regulate}
     *
     * Adds a word boundary metacharacter to the current regular expression
     *
     * Arguments:
     *   [negated]    {Boolean}    If true the metacharacter used will match all non-word-boundaries
     */
    Regulate.prototype.wordBoundary = function (negated) {
        this._output += negated ? "\\B" : "\\b";
        return this;
    };

    /**
     * Regulate#or() => {Regulate}
     *
     * Adds an 'or' operator to the current regular expression
     */
    Regulate.prototype.or = function () {
        this._output += "|";
        return this;
    };

    /**
     * Regulate#range(...r) => {Regulate}
     *
     * Adds a construct to match a specific range of letters or numbers to the current regular expression
     *
     * Arguments:
     *   ...r    {Array}    Any number of arrays containing 2 elements representing the lower and upper bounds of the range
     *
     * Example:
     *   regulate().range(["a", "z"]).toString()                  => "[a-z]"
     *   regulate().range(["a", "z", true], [0, 9]).toString()    => "[a-zA-Z0-9]"
     *   regulate().range([12, 20]).toString()                    => "(1[2-9]|20)"
     */
    Regulate.prototype.range = function () {
        var ranges = [].slice.call(arguments),
            simpleRange = "",
            complexRange = "";
        ranges.filter(function (range) {
            return (
                    getType(range[0]) === "string" &&
                    getType(range[1]) === "string"
                ) || (
                    getType(range[0]) === "number" && range[0] < 10 && range[0] >= 0 &&
                    getType(range[1]) === "number" && range[1] < 10 && range[1] >= 0
                );
        }).forEach(function (range) {
            var a = range[0],
                b = range[1],
                i = range[2];
            simpleRange += a + "-" + b;
            if (i) {
                simpleRange += (a.toUpperCase() === a ? a.toLowerCase() : a.toUpperCase()) + "-" + (b.toUpperCase() === b ? b.toLowerCase() : b.toUpperCase());
            }
        }, this);

        if (simpleRange) {
            simpleRange = "[" + simpleRange + "]";
        }

        ranges.filter(function (range) {
            return getType(range[0]) === "number" && getType(range[1]) === "number" && (range[0] >= 10 || range[1] >= 10);
        }).forEach(function (range) {
            if (complexRange) {
                complexRange += "|";
            }
            complexRange += "(" + collapsePowers(rangeToRegexes(range[0] + "", range[1] + "")).join("|") + ")";
        }, this);

        if (simpleRange && complexRange) {
            this._output += "(" + simpleRange + "|" + complexRange + ")";
        } else {
            this._output += simpleRange + complexRange;
        }

        return this;
    };

    // This is all that's exposed publicly
    function expose() {
        return new Regulate();
    }

    /////
    // Expose globally, again borrowed from Lo-Dash
    /////

    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        window.Regulate = expose;
        define(function () {
            return expose;
        });
    } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
            freeModule.exports = expose;
        } else {
            freeExports.Regulate = expose;
        }
    } else {
        window.Regulate = expose;
    }

}(this));