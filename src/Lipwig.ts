/**
 * @author: William Hayward
 */
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

type FunctionMap = {
    [index: string]: Function;
};

type RoomMap = {
    [index: string]: Room;
};

type RoomOptions = {
    size: number;
};

class Lipwig {
    private ws: WebSocket.server;
    private rooms: RoomMap;
    private server: http.Server;
    private reserved: FunctionMap;

    constructor(port: number = 8080) {
        const server: http.Server = http.createServer();
        this.server = server;

        server.on('error', (err: Error): void => {
            console.log('Port ' + port + ' in use');
        });

        server.listen(port, () => {
            console.log('Listening on ' + port);
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

        this.reserve('create', this.create);
        this.reserve('join', this.join);
        this.reserve('reconnect', this.reconnect);
        this.reserve('close', this.close);
    }

    public exit(code: number = 0): void {
        process.exit(code);
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
        connection.on('message', (message: WebSocketMessage): void => {
            const text: string = message.utf8Data.toString();
            let parsed: Message;
            try {
                parsed = JSON.parse(text);
            } catch (error) {
                connection.send(ErrorCode.MALFORMED); // TODO: Determine a numerical system for errors/messages

                return;
            }
            const error: ErrorCode = this.handle(parsed, connection);
            if (error !== ErrorCode.SUCCESS) {
                // TODO: return error code
            }
        });

        return;
    }

    private isOriginAllowed(origin: string): boolean {
        // TODO: Origin checking
        return true;
    }

    private handle(message: Message, connection: WebSocket.connection): ErrorCode {
        if (message.event in this.reserved) {
            message.data.unshift(connection);
            message.data.push(message);

            return this.reserved[message.event].apply(this, message.data);
        }

        return this.route(message);
    }

    private create(connection: WebSocket.connection, options?: RoomOptions): ErrorCode {
        let id: string;
        do {
            id = Utility.generateString();
        } while (this.rooms[id] !== undefined);

        const room: Room = new Room(id, connection);
        this.rooms[id] = room;

        return ErrorCode.SUCCESS;
    }

    private join(connection: WebSocket.connection, code: string): ErrorCode {
        const room: Room = this.rooms[code];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        return room.join(connection);
    }

    private reconnect(connection: WebSocket.connection, id: string): ErrorCode {
        const code: string = id.slice(0, 4);
        const room: Room = this.rooms[code];

        if (room === undefined) {
            return ErrorCode.ROOMNOTFOUND;
        }

        return room.reconnect(connection, id);
    }

    private close(connection: WebSocket.connection, reason: string, message: Message): ErrorCode {
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

    private kick(connection: WebSocket.connection, userID: string, reason: string, message: Message): ErrorCode {
        console.log('Trying to kick ' + userID);
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
