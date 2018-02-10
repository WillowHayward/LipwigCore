"use strict";
exports.__esModule = true;
var User = (function () {
    function User(id, socket) {
        var _this = this;
        this.id = id;
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
            recipient: []
        };
        this.send(reconnect);
        this.queue.forEach(function (message) {
            _this.send(message);
        });
        this.queue = [];
    };
    return User;
}());
exports.User = User;
