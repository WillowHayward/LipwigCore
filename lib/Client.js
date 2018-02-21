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
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(user) {
        var _this = _super.call(this) || this;
        _this.user = user;
        return _this;
    }
    Client.prototype.handle = function (message) {
        var args = message.data;
        args.unshift(message.event);
        args.push(message);
        this.emit.apply(this, args);
    };
    Client.prototype.send = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var message = {
            event: event,
            data: args,
            sender: this.user.getID(),
            recipient: []
        };
        this.user.send(message);
    };
    return Client;
}(EventManager_1.EventManager));
exports.Client = Client;
