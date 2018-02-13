"use strict";
exports.__esModule = true;
var http = require("http");
var WebSocket = require("websocket");
var ErrorCode_1 = require("./ErrorCode");
var Room_1 = require("./Room");
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
        this.reserve('create', this.create);
        this.reserve('join', this.join);
        this.reserve('reconnect', this.reconnect);
        this.reserve('close', this.close);
    }
    Lipwig.prototype.exit = function (code) {
        if (code === void 0) { code = 0; }
        process.exit(code);
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
        connection.on('message', function (message) {
            var text = message.utf8Data.toString();
            var parsed;
            try {
                parsed = JSON.parse(text);
            }
            catch (error) {
                connection.send(ErrorCode_1.ErrorCode.MALFORMED);
                return;
            }
            var error = _this.handle(parsed, connection);
            if (error !== ErrorCode_1.ErrorCode.SUCCESS) {
            }
        });
        return;
    };
    Lipwig.prototype.isOriginAllowed = function (origin) {
        return true;
    };
    Lipwig.prototype.handle = function (message, connection) {
        if (message.event in this.reserved) {
            message.data.unshift(connection);
            message.data.push(message);
            return this.reserved[message.event].apply(this, message.data);
        }
        return this.route(message);
    };
    Lipwig.prototype.create = function (connection, options) {
        var id;
        do {
            id = Utility_1.Utility.generateString();
        } while (this.rooms[id] !== undefined);
        var room = new Room_1.Room(id, connection);
        this.rooms[id] = room;
        return ErrorCode_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.join = function (connection, code) {
        var room = this.rooms[code];
        if (room === undefined) {
            return ErrorCode_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.join(connection);
    };
    Lipwig.prototype.reconnect = function (connection, id) {
        var code = id.slice(0, 4);
        var room = this.rooms[code];
        if (room === undefined) {
            return ErrorCode_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.reconnect(connection, id);
    };
    Lipwig.prototype.close = function (connection, reason, message) {
        var id = message.sender;
        var room = this.rooms[id];
        if (room === undefined) {
            return ErrorCode_1.ErrorCode.ROOMNOTFOUND;
        }
        if (id !== room.getID()) {
            return ErrorCode_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        var user = room.find(id);
        if (user === undefined) {
            return ErrorCode_1.ErrorCode.USERNOTFOUND;
        }
        if (!user.equals(connection)) {
            return ErrorCode_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        room.close(reason);
        delete this.rooms[id];
        return ErrorCode_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.kick = function (connection, id, reason) {
        var room = this.rooms[id];
        if (room === undefined) {
            return ErrorCode_1.ErrorCode.ROOMNOTFOUND;
        }
        if (id !== room.getID()) {
            return ErrorCode_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        var user = room.find(id);
        if (user === undefined) {
            return ErrorCode_1.ErrorCode.USERNOTFOUND;
        }
        if (!user.equals(connection)) {
            return ErrorCode_1.ErrorCode.INSUFFICIENTPERMISSIONS;
        }
        room.close(reason);
        delete this.rooms[id];
        return ErrorCode_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.route = function (message) {
        var roomID = message.sender.slice(0, 4);
        var room = this.rooms[roomID];
        if (room === undefined) {
            return ErrorCode_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.route(message);
    };
    return Lipwig;
}());
module.exports = Lipwig;
