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
exports.Host = void 0;
var lipwig_events_1 = require("lipwig-events");
var Host = (function (_super) {
    __extends(Host, _super);
    function Host(id) {
        var _this = _super.call(this) || this;
        _this.id = id;
        return _this;
    }
    Host.prototype.getID = function () {
        return this.id;
    };
    Host.prototype.handle = function (message) {
        var args = message.data;
        args.push(message);
        this.emit.apply(this, __spreadArrays([message.event], args));
    };
    return Host;
}(lipwig_events_1.EventManager));
exports.Host = Host;
