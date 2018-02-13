"use strict";
exports.__esModule = true;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["MALFORMED"] = 1] = "MALFORMED";
    ErrorCode[ErrorCode["ROOMNOTFOUND"] = 2] = "ROOMNOTFOUND";
    ErrorCode[ErrorCode["ROOMFULL"] = 3] = "ROOMFULL";
    ErrorCode[ErrorCode["USERNOTFOUND"] = 4] = "USERNOTFOUND";
    ErrorCode[ErrorCode["INSUFFICIENTPERMISSIONS"] = 5] = "INSUFFICIENTPERMISSIONS";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
