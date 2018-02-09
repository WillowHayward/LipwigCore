"use strict";
exports.__esModule = true;
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var Utility;
(function (Utility) {
    Utility.generateString = function (length, characters) {
        if (length === void 0) { length = 4; }
        if (characters === void 0) { characters = alphabet; }
        if (characters.length === 0) {
            return '';
        }
        var str = '';
        var index;
        while (str.length < length) {
            index = Math.random() * characters.length;
            index = Math.floor(index);
            str += characters[index];
        }
        return str;
    };
})(Utility = exports.Utility || (exports.Utility = {}));
