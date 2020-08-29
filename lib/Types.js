"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.testConfig = exports.defaultConfig = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["MALFORMED"] = 1] = "MALFORMED";
    ErrorCode[ErrorCode["ROOMNOTFOUND"] = 2] = "ROOMNOTFOUND";
    ErrorCode[ErrorCode["ROOMFULL"] = 3] = "ROOMFULL";
    ErrorCode[ErrorCode["USERNOTFOUND"] = 4] = "USERNOTFOUND";
    ErrorCode[ErrorCode["INSUFFICIENTPERMISSIONS"] = 5] = "INSUFFICIENTPERMISSIONS";
    ErrorCode[ErrorCode["INCORRECTPASSWORD"] = 6] = "INCORRECTPASSWORD";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
exports.defaultConfig = {
    port: 8989,
    roomNumberLimit: 0,
    roomSizeLimit: 0,
    http: undefined,
    name: '',
    db: './lipwig.db'
};
exports.testConfig = __assign(__assign({}, exports.defaultConfig), { db: './lipwig.db.tmp' });
