"use strict";
exports.__esModule = true;
var Client_1 = require("./Client");
var User = (function () {
    function User(id, socket) {
        var _this = this;
        this.id = id;
        if (socket === null) {
            return;
        }
        this.socket = socket;
        this.socket.on('close', function (code, desc) {
            _this.socket.removeAllListeners();
            _this.socket = null;
            _this.queue = [];
        });
    }
    User.prototype.getID = function () {
        return this.id;
    };
    User.prototype.getClient = function () {
        if (this.client === undefined) {
            this.client = new Client_1.Client(this);
        }
        return this.client;
    };
    User.prototype.send = function (message) {
        if (this.socket === null) {
            this.queue.push(message);
            return;
        }
        var text = JSON.stringify(message);
        this.socket.sendUTF(text);
    };
    User.prototype.reconnect = function (socket) {
        var _this = this;
        this.socket = socket;
        var reconnect = {
            event: 'reconnected',
            data: [],
            sender: '',
            recipient: [this.id]
        };
        this.send(reconnect);
        this.queue.forEach(function (message) {
            _this.send(message);
        });
        this.queue = [];
    };
    User.prototype.close = function () {
        this.socket.close();
    };
    User.prototype.equals = function (socket) {
        return this.socket === socket;
    };
    return User;
}());
exports.User = User;
