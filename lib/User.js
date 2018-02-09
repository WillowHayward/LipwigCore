"use strict";
exports.__esModule = true;
var User = (function () {
    function User(id, socket) {
        this.id = id;
        this.socket = socket;
    }
    User.prototype.getID = function () {
        return this.id;
    };
    User.prototype.send = function (message) {
        var text = JSON.stringify(message);
        this.socket.sendUTF(text);
    };
    return User;
}());
exports.User = User;
