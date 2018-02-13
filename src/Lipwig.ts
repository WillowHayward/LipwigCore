/**
 * @author: William Hayward
 */
import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'websocket';
import { Room } from './Room';
import { ErrorCode, Message } from './Types';
import { User } from './User';
import { Utility } from './Utility';

type WebSocketMessage = {
    type: string; // tslint:disable-line:no-reserved-keywords
    utf8Data: string;
};

type StringMap = {
    [index: string]: string;
};

type FunctionMap = {
    [index: string]: Function;
};

type RoomMap = {
    [index: string]: Room;
};

type RoomOptions = {
    size: number;
};

class Lipwig extends EventEmitter {
    private ws: WebSocket.server;
    private rooms: RoomMap;
    private server: http.Server;
    private reserved: FunctionMap;
    private connections: WebSocket.connection[];

    constructor(port: number = 8080) {
        super();
        const server: http.Server = http.createServer();
        this.server = server;

        server.on('error', (err: Error): void => {
            console.log('Port ' + port + ' in use');
        });

        server.listen(port, () => {
            console.log('Listening on ' + port);
            this.emit('started');
        });
        this.ws = new WebSocket.server({
            httpServer: server,
            autoAcceptConnections: false
        });

        this.ws.on('request', (request: WebSocket.request): void => {
            this.newRequest(request);
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

    public exit(code: number = 0): void {
        this.server.close();
        this.connections.forEach((socket: WebSocket.connection): void => {
            if (socket.connected) {
                socket.close();
            }
        });
    }

    private reserve(event: string, callback: Function): void {
        this.reserved[event] = callback.bind(this);
    }

    private newRequest(request: WebSocket.request): void {
        if (!this.isOriginAllowed(request.origin)) {
            request.reject();

            return;
        }

        const connection: WebSocket.connection = request.accept(request.requestedProtocols[0], request.origin);
        this.connections.push(connection); // TODO: This doesn't get filtered down on disconnect
        connection.on('message', (message: WebSocketMessage): void => {
            const text: string = message.utf8Data.toString();
            let parsed: Message;
            try {
                parsed = JSON.parse(text);

                if (!this.isValidMessage(parsed)) {
                    throw new Error();
                }
            } catch (error) {
                this.reportError(connection, ErrorCode.MALFORMED, text);

                return;
            }
            const error: ErrorCode = this.handle(parsed, connection); // TODO: Consider wrapping this in a try..catch
            if (error !== ErrorCode.SUCCESS) {
                this.reportError(connection, error, text);
            }
        });

        return;
    }

    private isValidMessage(message: Message): boolean {
        // TODO: Properly implement this
        return true;

        /*
        const types: StringMap = {
            event: 'string',
            data: 'object',
            sender: 'string',
            recipient: 'object'
        };

        const keys: string[] = Object.keys(message);
        if (keys.length !== 4) {
            console.log('Wrong length');

            return false;
        }

        let correctFormat: boolean = true;
        keys.forEach((key: string): void => {
            if (typeof message[key] !== types[key]) {
                console.log(key + ' is wrong type');
                correctFormat = false;
            }
        });

        if (!correctFormat) {
            return false;
        }*/
    }

    private reportError(connection: WebSocket.connection, code: ErrorCode, cause: string): void {
        const message: Message = {
            event: 'error',
            data: [code, cause],
            sender: '',
            recipient: []
        };
        const text: string = JSON.stringify(message);
        connection.send(text);
    }

    private isOriginAllowed(origin: string): boolean {
        // TODO: Origin checking
        return true;
    }

    private handle(message: Message, connection: WebSocket.connection): ErrorCode {
        if (message.event in this.reserved) {
            return this.reserved[message.event](connection, message);
        }

        return this.route(message);
    }

    private create(connection: WebSocket.connection, message: Message): ErrorCode {
        const options: RoomOptions = message.data[0];
        let id: string;
        do {
            id = Utility.generateString();
        } while (this.rooms[id] !== undefined);

        const room: Room = new Room(id, connection);
        this.rooms[id] = room;

        return ErrorCode.SUCCESS;
    }

    private join(connection: WebSocket.connection, message: Message): ErrorCode {
        const code: string = message.data[0];
        const room: Room = this.rooms[code];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        return room.join(connection);
    }

    private reconnect(connection: WebSocket.connection, message: Message): ErrorCode {
        const id: string = message.data[0];
        const code: string = id.slice(0, 4);
        const room: Room = this.rooms[code];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        return room.reconnect(connection, id);
    }

    private close(connection: WebSocket.connection, message: Message): ErrorCode {
        const reason: string = message.data[0];
        const id: string = message.sender;
        const room: Room = this.rooms[id];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        if (id !== room.getID()) {
            return ErrorCode.INSUFFICIENTPERMISSIONS;
        }

        const user: User = room.find(id);

        if (user === undefined) {
            return ErrorCode.USERNOTFOUND;
        }

        if (!user.equals(connection)) {
            return ErrorCode.INSUFFICIENTPERMISSIONS;
        }

        room.close(reason);
        delete this.rooms[id];

        return ErrorCode.SUCCESS;
    }

    private kick(connection: WebSocket.connection, message: Message): ErrorCode {
        const userID: string = message.data[0];
        const reason: string = message.data[1];
        const id: string = message.sender;
        const room: Room = this.rooms[id];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        if (id !== room.getID()) {
            return ErrorCode.INSUFFICIENTPERMISSIONS;
        }

        const user: User = room.find(id);

        if (user === undefined) {
            return ErrorCode.USERNOTFOUND;
        }

        if (!user.equals(connection)) {
            return ErrorCode.INSUFFICIENTPERMISSIONS;
        }

        return room.kick(userID, reason);
    }

    private route(message: Message): ErrorCode {
        const roomID: string = message.sender.slice(0, 4);
        const room: Room = this.rooms[roomID];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        return room.route(message);
    }
}

module.exports = Lipwig;
