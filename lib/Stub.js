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
var events_1 = require("events");
var WebSocket = require("websocket");
var Stub = (function (_super) {
    __extends(Stub, _super);
    function Stub(url) {
        var _this = _super.call(this) || this;
        var client = new WebSocket.client();
        client.connect(url);
        client.on('connect', function (connection) {
            _this.socket = connection;
            _this.socket.on('message', function (evt) {
                _this.handle(evt);
            });
            _this.emit('connected');
        });
        return _this;
    }
    Stub.prototype.send = function (message) {
        var text = JSON.stringify(message);
        this.socket.send(text);
    };
    Stub.prototype.handle = function (evt) {
        var message = JSON.parse(evt.utf8Data);
        var args = message.data;
        args.unshift(message.event);
        args.push(message);
        this.emit.apply(this, args);
    };
    return Stub;
}(events_1.EventEmitter));
exports.Stub = Stub;
