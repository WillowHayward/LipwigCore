"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.Stub = void 0;
var WebSocket = require("websocket");
var lipwig_events_1 = require("lipwig-events");
var Stub = (function (_super) {
    __extends(Stub, _super);
    function Stub(url) {
        var _this = _super.call(this) || this;
        var client = new WebSocket.client();
        client.connect(url);
        _this.socket = null;
        _this.queue = [];
        client.on('connect', function (connection) {
            _this.socket = connection;
            _this.socket.on('message', function (evt) {
                _this.handle(evt);
            });
            _this.emit('connected');
            _this.queue.forEach(function (message) {
                _this.send(message);
            });
        });
        return _this;
    }
    Stub.prototype.send = function (message) {
        if (this.socket === null) {
            this.queue.push(message);
            return;
        }
        var text = JSON.stringify(message);
        this.socket.send(text);
    };
    Stub.prototype.handle = function (evt) {
        var rawMessage = evt.utf8Data;
        var message = JSON.parse(rawMessage);
        var args = message.data;
        args.push(message);
        this.emit.apply(this, __spreadArrays([message.event], args));
    };
    return Stub;
}(lipwig_events_1.EventManager));
exports.Stub = Stub;
