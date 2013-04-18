;(function (window) {

    "use strict";

    /*****
     * Global object stuff, borrowed from Lo-Dash
     *****/
    var freeExports = typeof exports === "object" && exports,
        freeModule = typeof module === "object" && module && module.exports === freeExports && module,
        freeGlobal = typeof global === "object" && global;

    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        window = freeGlobal;
    }

    /*****
     * Regulate
     *****/

    // Private constructor
    function Regulate() {
        this._output = "";
    }

    Regulate.prototype.toString = function () {
        return this._output;
    };

    Regulate.prototype.toRegExp = function () {
        return new RegExp(this._output);
    };

    Regulate.prototype.start = function () {
        this._output += "^";
        return this;
    };

    Regulate.prototype.end = function () {
        this._output += "$";
        return _this;
    };

    Regulate.prototype.string = function (str) {
        this._output += str;
        return this;
    };

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

    Regulate.prototype.oneOf = function (chars, negated) {
        this._output += "[";
        if (negated) {
            this._output += "^";
        }
        this._output += chars + "]";
        return this;
    };

    Regulate.prototype.noneOf = function (chars) {
        return this.oneOf(chars, true);
    };

    Regulate.prototype.repeat = function (min, max) {
        if (min < 0) {
            this._output += "*";
            if (max === false) {
                this._output += "?"; // Non-greedy
            }
        } else if (min === 1 && (max < 0 || max === false)) {
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

    Regulate.prototype.optional = function () {
        this._output += "?";
        return this;
    };

    Regulate.prototype.notFollowedBy = function (content) {
        this._output += "(?!";
        this._output += content instanceof Regulate ? content.toString() : content;
        this._output += ")";
        return this;
    };

    Regulate.prototype.or = function () {
        this._output += "|";
    };

    // This is all that's exposed publicly
    function expose() {
        return new Regulate();
    }

    /*****
     * Expose globally, again borrowed from Lo-Dash
     *****/
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