"use strict";
exports.__esModule = true;
exports.DEFAULTS = exports.ErrorCode = void 0;
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
exports.DEFAULTS = {
    port: 8989
};
