/**
 * @author: William Hayward
 */
import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'websocket';
import { Client } from './Client';
import { EventManager } from './EventManager';
import { Host } from './Host';
import { Room } from './Room';
import { ErrorCode, LipwigOptions, Message, RoomOptions, UserOptions } from './Types';
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

class Lipwig extends EventManager {
    private options: LipwigOptions;
    private ws: WebSocket.server;
    private rooms: RoomMap;
    private reserved: FunctionMap;
    private connections: WebSocket.connection[];
    constructor(options: LipwigOptions = {}) {
        super();
        options.name = options.name || '';
        options.port = options.port || 8080;
        options.roomNumberLimit = options.roomNumberLimit || 0;
        options.roomSizeLimit = options.roomSizeLimit || 0;

        if (options.http === undefined) {
            const server: http.Server = http.createServer();

            server.on('error', (err: Error): void => {
                console.log('Port ' + options.port + ' in use');
            });

            server.listen(options.port, () => {
                console.log('Listening on ' + options.port);
                this.emit('started');
            });

            options.http = server;
        } else {
            this.emit('started');
        }

        this.options = options;

        this.ws = new WebSocket.server({
            httpServer: options.http,
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

    public exit(): void {
        if (this.options.http instanceof http.Server || this.options.http instanceof https.Server) {
            this.options.http.close();

            this.options.http.on('close', (): void => {
                this.emit('closed');
            });
        } else {
            const httpList: (http.Server | https.Server)[] = (<(http.Server | https.Server)[]>this.options.http);
            // Cast to array for type safety
            httpList.forEach((instance: http.Server | https.Server): void => {
                instance.close();
                instance.on('close', (): void => {
                    // TODO: This might emit before all http instances are closed
                    this.emit('closed');
                });
            });
        }

        this.connections.slice(0).forEach((socket: WebSocket.connection): void => {
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
        this.connections.push(connection);
        connection.on('message', (message: WebSocketMessage): void => {
            const text: string = message.utf8Data.toString();
            const parsed: Message | ErrorCode = this.getMessage(text);

            if (typeof parsed === 'number') {
                // ErrorCode
                const error: ErrorCode = parsed;
                this.reportError(connection, error, message.utf8Data);

                return;
            }

            const response: ErrorCode = this.handle(parsed, connection);

            if (response !== ErrorCode.SUCCESS) {
                this.reportError(connection, response, text);
            }
        });

        connection.on('close', (): void => {
            const index: number = this.connections.indexOf(connection);
            this.connections.splice(index, 1);
        });

        return;
    }

    private getMessage(text: string): ErrorCode | Message {
        let message: Message;
        try {
            message = JSON.parse(text);
        } catch (error) {
            return ErrorCode.MALFORMED;
        }

        if (!this.isValidMessage(message)) {
            return ErrorCode.MALFORMED;
        }

        return message;
    }

    private isValidMessage(message: Message): boolean {
        // TODO: Properly implement this

        if (typeof message.data !== 'object' ||
            typeof message.event !== 'string' ||
            typeof message.sender !== 'string' ||
            typeof message.recipient !== 'object') {
                return false;
        }

        const keys: string[] = Object.keys(message);
        if (keys.length !== 4) {
            return false;
        }

        return true;
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
        console.log(message);
        const options: RoomOptions = message.data[0] || {};
        console.log(options);
        if (typeof options !== 'object') {
            return ErrorCode.MALFORMED;
        }

        let id: string;
        do {
            id = Utility.generateString();
        } while (this.rooms[id] !== undefined);

        const room: Room = new Room(id, connection, options);
        this.rooms[id] = room;

        if (room.isRemote()) {
            const host: Host = room.getRemoteHost();
            const creator: Client = room.getRemoteCreator();
            this.emit('created', host, creator);
        }

        return ErrorCode.SUCCESS;
    }

    private join(connection: WebSocket.connection, message: Message): ErrorCode {
        const code: string = message.data[0];

        if (typeof code !== 'string') {
            return ErrorCode.MALFORMED;
        }

        let data: UserOptions = message.data[1];

        if (data === undefined) {
            data = {};
        }

        if (typeof data !== 'object') {
            return ErrorCode.MALFORMED;
        }

        const room: Room = this.rooms[code];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        if (!room.checkPassword(data.password)) {
            return ErrorCode.INCORRECTPASSWORD;
        }
        delete data.password;

        return room.join(connection, data);
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

        if (user === null) {
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
