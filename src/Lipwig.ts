/**
 * @author: William Hayward
 */
import * as http from 'http';
import * as WebSocket from 'websocket';
import { ErrorCode } from './ErrorCode';
import { Room } from './Room';
import { User } from './User';
import { Utility } from './Utility';

type WebSocketMessage = {
    type: string; // tslint:disable-line:no-reserved-keywords
    utf8Data: string;
};

type Message = {
    event: string;
    data: any[]; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
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
    constructor(port: number = 8080) {
        const server: http.Server = http.createServer();
        this.server = server;

        server.on('error', (err: Error): void => {
            console.log(port + ' in use. Exiting.');
            this.exit();
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
    }

    public exit(code: number = 0): void {
        process.exit(code);
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
        // TODO: Turn this into a map of functions
        switch (message.event) {
            case 'create':
                message.data.unshift(connection);

                return this.create.apply(this, message.data);
            case 'join':
                message.data.unshift(connection);

                return this.join.apply(this, message.data);
            case 'reconnect':
                message.data.unshift(connection);

                return this.reconnect.apply(this, message.data);
            case 'close':
                message.data.unshift(connection);

                return this.close.apply(this, message.data);
            default:
                return this.route(message);
        }
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

    private close(connection: WebSocket.connection, id: string, reason: string): ErrorCode {
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
