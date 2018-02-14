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
var http = require("http");
var WebSocket = require("websocket");
var Room_1 = require("./Room");
var Types_1 = require("./Types");
var Utility_1 = require("./Utility");
var Lipwig = (function (_super) {
    __extends(Lipwig, _super);
    function Lipwig(port) {
        if (port === void 0) { port = 8080; }
        var _this = _super.call(this) || this;
        var server = http.createServer();
        _this.server = server;
        server.on('error', function (err) {
            console.log('Port ' + port + ' in use');
        });
        server.listen(port, function () {
            console.log('Listening on ' + port);
            _this.emit('started');
        });
        _this.ws = new WebSocket.server({
            httpServer: server,
            autoAcceptConnections: false
        });
        _this.ws.on('request', function (request) {
            _this.newRequest(request);
        });
        _this.rooms = {};
        _this.reserved = {};
        _this.connections = [];
        _this.reserve('create', _this.create);
        _this.reserve('join', _this.join);
        _this.reserve('reconnect', _this.reconnect);
        _this.reserve('close', _this.close);
        _this.reserve('kick', _this.kick);
        return _this;
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
            var parsed = _this.getMessage(text);
            if (typeof parsed === 'number') {
                var error = parsed;
                _this.reportError(connection, error, message.utf8Data);
                return;
            }
            var response = _this.handle(parsed, connection);
            if (response !== Types_1.ErrorCode.SUCCESS) {
                _this.reportError(connection, response, text);
            }
        });
        return;
    };
    Lipwig.prototype.getMessage = function (text) {
        var message;
        try {
            message = JSON.parse(text);
        }
        catch (error) {
            return Types_1.ErrorCode.MALFORMED;
        }
        if (!this.isValidMessage(message)) {
            return Types_1.ErrorCode.MALFORMED;
        }
        return message;
    };
    Lipwig.prototype.isValidMessage = function (message) {
        if (typeof message.data !== 'object' ||
            typeof message.event !== 'string' ||
            typeof message.sender !== 'string' ||
            typeof message.recipient !== 'object') {
            return false;
        }
        var keys = Object.keys(message);
        if (keys.length !== 4) {
            return false;
        }
        return true;
    };
    Lipwig.prototype.reportError = function (connection, code, cause) {
        var message = {
            event: 'error',
            data: [code, cause],
            sender: '',
            recipient: []
        };
        var text = JSON.stringify(message);
        connection.send(text);
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
}(events_1.EventEmitter));
module.exports = Lipwig;
