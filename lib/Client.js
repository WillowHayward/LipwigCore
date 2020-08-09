"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Client = void 0;
var EventManager_1 = require("./EventManager");
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    Client.prototype.handle = function (message) {
        var args = message.data;
        args.push(message);
        this.emit.apply(this, __spreadArrays([message.event], args));
    };
    Client.prototype.send = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var message = {
            event: event,
            data: __spreadArrays(args),
            sender: this.user.getID(),
            recipient: []
        };
        this.user.send(message);
    };
    return Client;
}(EventManager_1.EventManager));
exports.Client = Client;
