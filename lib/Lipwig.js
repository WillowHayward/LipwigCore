"use strict";
exports.__esModule = true;
var http = require("http");
var WebSocket = require("websocket");
var Room_1 = require("./Room");
var Types_1 = require("./Types");
var Utility_1 = require("./Utility");
var Lipwig = (function () {
    function Lipwig(port) {
        if (port === void 0) { port = 8080; }
        var _this = this;
        var server = http.createServer();
        this.server = server;
        server.on('error', function (err) {
            console.log('Port ' + port + ' in use');
        });
        server.listen(port, function () {
            console.log('Listening on ' + port);
        });
        this.ws = new WebSocket.server({
            httpServer: server,
            autoAcceptConnections: false
        });
        this.ws.on('request', function (request) {
            _this.newRequest(request);
        });
        this.rooms = {};
        this.reserved = {};
        this.connections = [];
        this.reserve('create', this.create);
        this.reserve('join', this.join);
        this.reserve('reconnect', this.reconnect);
        this.reserve('close', this.close);
        this.reserve('kick', this.kick);
    }
    Lipwig.prototype.exit = function (code) {
        if (code === void 0) { code = 0; }
        this.server.close();
        this.connections.forEach(function (socket) {
            if (socket.connected) {
                socket.close();
            }
        });
    };
    Lipwig.prototype.reserve = function (event, callback) {
        this.reserved[event] = callback.bind(this);
    };
    Lipwig.prototype.newRequest = function (request) {
        var _this = this;
        if (!this.isOriginAllowed(request.origin)) {
            request.reject();
            return;
        }
        var connection = request.accept(request.requestedProtocols[0], request.origin);
        this.connections.push(connection);
        connection.on('message', function (message) {
            var text = message.utf8Data.toString();
            var parsed;
            try {
                parsed = JSON.parse(text);
            }
            catch (error) {
                connection.send(Types_1.ErrorCode.MALFORMED);
                return;
            }
            var error = _this.handle(parsed, connection);
            if (error !== Types_1.ErrorCode.SUCCESS) {
            }
        });
        return;
    };
    Lipwig.prototype.isOriginAllowed = function (origin) {
        return true;
    };
    Lipwig.prototype.handle = function (message, connection) {
        if (message.event in this.reserved) {
            return this.reserved[message.event](connection, message);
        }
        return this.route(message);
    };
    Lipwig.prototype.create = function (connection, message) {
        var options = message.data[0];
        var id;
        do {
            id = Utility_1.Utility.generateString();
        } while (this.rooms[id] !== undefined);
        var room = new Room_1.Room(id, connection);
        this.rooms[id] = room;
        return Types_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.join = function (connection, message) {
        var code = message.data[0];
        var room = this.rooms[code];
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.join(connection);
    };
    Lipwig.prototype.reconnect = function (connection, message) {
        var id = message.data[0];
        var code = id.slice(0, 4);
        var room = this.rooms[code];
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.reconnect(connection, id);
    };
    Lipwig.prototype.close = function (connection, message) {
        var reason = message.data[0];
        var id = message.sender;
        var room = this.rooms[id];
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        if (id !== room.getID()) {
            return Types_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        var user = room.find(id);
        if (user === undefined) {
            return Types_1.ErrorCode.USERNOTFOUND;
        }
        if (!user.equals(connection)) {
            return Types_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        room.close(reason);
        delete this.rooms[id];
        return Types_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.kick = function (connection, message) {
        var userID = message.data[0];
        var reason = message.data[1];
        var id = message.sender;
        var room = this.rooms[id];
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        if (id !== room.getID()) {
            return Types_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        var user = room.find(id);
        if (user === undefined) {
            return Types_1.ErrorCode.USERNOTFOUND;
        }
        if (!user.equals(connection)) {
            return Types_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        return room.kick(userID, reason);
    };
    Lipwig.prototype.route = function (message) {
        var roomID = message.sender.slice(0, 4);
        var room = this.rooms[roomID];
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.route(message);
    };
    return Lipwig;
}());
module.exports = Lipwig;
