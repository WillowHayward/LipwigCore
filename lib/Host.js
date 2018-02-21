"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var EventManager_1 = require("./EventManager");
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
        args.unshift(message.event);
        args.push(message);
        this.emit.apply(this, args);
    };
    return Host;
}(EventManager_1.EventManager));
exports.Host = Host;
