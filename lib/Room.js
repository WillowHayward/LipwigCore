"use strict";
exports.__esModule = true;
var Types_1 = require("./Types");
var User_1 = require("./User");
var Utility_1 = require("./Utility");
var Room = (function () {
    function Room(id, host) {
        this.maxSize = 9;
        this.id = id;
        this.users = {};
        if (host !== undefined) {
            this.host = new User_1.User('', host);
            var message = {
                event: 'created',
                data: [id],
                sender: '',
                recipient: []
            };
            this.host.send(message);
        }
    }
    Room.prototype.join = function (socket) {
        var id;
        do {
            id = Utility_1.Utility.generateString();
        } while (this.users[id] !== undefined);
        var user = new User_1.User(id, socket);
        var error = this.add(user);
        if (error === Types_1.ErrorCode.SUCCESS) {
            var message = {
                event: 'joined',
                data: [this.id + user.getID()],
                sender: '',
                recipient: ['']
            };
            user.send(message);
            this.host.send(message);
        }
        return error;
    };
    Room.prototype.add = function (user) {
        if (this.size() === this.maxSize) {
            return Types_1.ErrorCode.ROOMFULL;
        }
        var id = user.getID();
        this.users[id] = user;
        return Types_1.ErrorCode.SUCCESS;
    };
    Room.prototype.reconnect = function (connection, id) {
        var user;
        if (id === this.id) {
            user = this.host;
        }
        else {
            var userID = id.slice(4, 8);
            user = this.users[userID];
            if (user === undefined) {
                return Types_1.ErrorCode.USERNOTFOUND;
            }
        }
        user.reconnect(connection);
        return Types_1.ErrorCode.SUCCESS;
    };
    Room.prototype.find = function (userID) {
        if (userID === this.id) {
            return this.host;
        }
        var user = this.users[userID];
        if (user === undefined) {
            return null;
        }
        return user;
    };
    Room.prototype.size = function () {
        return Object.keys(this.users).length;
    };
    Room.prototype.route = function (message) {
        var _this = this;
        var users = [];
        var missingUser = false;
        if (message.sender !== this.id) {
            this.host.send(message);
            return Types_1.ErrorCode.SUCCESS;
        }
        message.recipient.forEach(function (id) {
            var userID = id.slice(4, 8);
            var user = _this.users[userID];
            if (user === undefined) {
                missingUser = true;
                return;
            }
            users.push(user);
        });
        if (missingUser) {
            return Types_1.ErrorCode.USERNOTFOUND;
        }
        users.forEach(function (user) {
            user.send(message);
        });
        return Types_1.ErrorCode.SUCCESS;
    };
    Room.prototype.close = function (reason) {
        var _this = this;
        var message = {
            event: 'closed',
            data: [reason],
            sender: this.id,
            recipient: []
        };
        var user;
        var userIDs = Object.keys(this.users);
        userIDs.forEach(function (id) {
            user = _this.users[id];
            message.recipient = [user.getID()];
            user.send(message);
            user.close();
        });
        message.recipient = [this.id];
        this.host.send(message);
        this.host.close();
    };
    Room.prototype.kick = function (id, reason) {
        var userID = id.slice(4, 8);
        var user = this.users[userID];
        if (user === undefined) {
            return Types_1.ErrorCode.USERNOTFOUND;
        }
        var message = {
            event: 'kicked',
            data: [reason],
            sender: this.id,
            recipient: [id]
        };
        user.send(message);
        return Types_1.ErrorCode.SUCCESS;
    };
    Room.prototype.getID = function () {
        return this.id;
    };
    return Room;
}());
exports.Room = Room;
