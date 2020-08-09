"use strict";
exports.__esModule = true;
exports.Utility = void 0;
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var Utility = (function () {
    function Utility() {
    }
    Utility.generateString = function (length, characters) {
        if (length === void 0) { length = 4; }
        if (characters === void 0) { characters = alphabet; }
        if (characters.length === 0) {
            return '';
        }
        var str = '';
        while (str.length < length) {
            var index = Math.random() * characters.length;
            index = Math.floor(index);
            str += characters[index];
        }
        return str;
    };
    return Utility;
}());
exports.Utility = Utility;
