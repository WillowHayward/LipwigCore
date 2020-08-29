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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var http = require("http");
var https = require("https");
var WebSocket = require("websocket");
var winston = require("winston");
var wbs = require("winston-better-sqlite3");
var Dashboard_1 = require("./dash/Dashboard");
var lipwig_events_1 = require("lipwig-events");
var Room_1 = require("./Room");
var Types_1 = require("./Types");
var Utility_1 = require("./Utility");
var Lipwig = (function (_super) {
    __extends(Lipwig, _super);
    function Lipwig(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.logger = winston.createLogger({
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            transports: [
                new wbs({
                    db: 'lipwig.db'
                })
            ]
        });
        var options = __assign(__assign({}, Types_1.defaultConfig), config);
        if (options.http === undefined) {
            var server_1 = http.createServer();
            server_1.on('error', function (err) {
                console.log(err);
                console.log('Port ' + options.port + ' in use');
            });
            server_1.listen(options.port, function () {
                console.log('Listening on ' + options.port);
                new Dashboard_1.Dashboard(server_1);
                _this.emit('started');
            });
            options.http = server_1;
        }
        else {
            new Dashboard_1.Dashboard(options.http);
            _this.emit('started');
        }
        _this.options = options;
        _this.ws = new WebSocket.server({
            httpServer: options.http,
            autoAcceptConnections: false
        });
        _this.ws.on('request', function (request) {
            _this.newRequest(request);
        });
        _this.rooms = {};
        _this.connections = [];
        _this.reserved = new lipwig_events_1.EventManager();
        _this.reserved.on('create', _this.create, { object: _this });
        _this.reserved.on('join', _this.join, { object: _this });
        _this.reserved.on('reconnect', _this.reconnect, { object: _this });
        _this.reserved.on('close', _this.close, { object: _this });
        _this.reserved.on('kick', _this.kick, { object: _this });
        _this.reserved.on('lw-ping', _this.ping, { object: _this });
        return _this;
    }
    Lipwig.prototype.exit = function () {
        var _this = this;
        if (this.options.http instanceof http.Server || this.options.http instanceof https.Server) {
            this.options.http.close();
            this.options.http.on('close', function () {
                _this.emit('closed');
            });
        }
        else {
        }
        this.connections.slice(0).forEach(function (socket) {
            if (socket.connected) {
                socket.close();
            }
        });
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
                _this.reportError(connection, error, text);
                return;
            }
            var response = _this.handle(parsed, connection);
            if (response == Types_1.ErrorCode.SUCCESS) {
                _this.logger.log({
                    'level': 'info',
                    'message': text
                });
            }
            else {
                _this.reportError(connection, response, text);
            }
        });
        connection.on('close', function () {
            var index = _this.connections.indexOf(connection);
            _this.connections.splice(index, 1);
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
        this.logger.log({
            'level': 'error',
            'message': text
        });
        connection.send(text);
    };
    Lipwig.prototype.isOriginAllowed = function (origin) {
        if (origin) {
            return true;
        }
        return true;
    };
    Lipwig.prototype.handle = function (message, connection) {
        if (this.reserved.contains(message.event)) {
            var callback = this.reserved.get(message.event);
            var response = callback(connection, message);
            return response;
        }
        return this.route(message);
    };
    Lipwig.prototype.ping = function (connection, message) {
        message.event = 'pong';
        var text = JSON.stringify(message);
        connection.send(text);
        return Types_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.create = function (connection, message) {
        var options = message.data[0] || {};
        if (typeof options !== 'object') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var id;
        do {
            id = Utility_1.Utility.generateString();
        } while (this.find(id) !== undefined);
        var room = new Room_1.Room(id, connection, options);
        this.rooms[id] = room;
        return Types_1.ErrorCode.SUCCESS;
    };
    Lipwig.prototype.join = function (connection, message) {
        if (typeof message.data[0] !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var code = message.data[0];
        var data = message.data[1];
        if (data === undefined) {
            data = {};
        }
        if (typeof data !== 'object') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var room = this.find(code);
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        if (data.password === undefined) {
            data.password = '';
        }
        if (typeof data.password !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var password = data.password;
        if (!room.checkPassword(password)) {
            return Types_1.ErrorCode.INCORRECTPASSWORD;
        }
        delete data.password;
        return room.join(connection, data);
    };
    Lipwig.prototype.reconnect = function (connection, message) {
        if (typeof message.data[0] !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var id = message.data[0];
        var code = id.slice(0, 4);
        var room = this.find(code);
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.reconnect(connection, id);
    };
    Lipwig.prototype.close = function (connection, message) {
        if (typeof message.data[0] !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var reason = message.data[0];
        var id = message.sender;
        var room = this.find(id);
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
        if (typeof message.data[0] !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        if (typeof message.data[1] !== 'string') {
            return Types_1.ErrorCode.MALFORMED;
        }
        var userID = message.data[0];
        var reason = message.data[1];
        var id = message.sender;
        var room = this.find(id);
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
        var room = this.find(roomID);
        if (room === undefined) {
            return Types_1.ErrorCode.ROOMNOTFOUND;
        }
        return room.route(message);
    };
    Lipwig.prototype.find = function (code) {
        return this.rooms[code];
    };
    return Lipwig;
}(lipwig_events_1.EventManager));
module.exports = Lipwig;
