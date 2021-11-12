/**
 * @author: WillHayCode
 */
import { connection as WebSocketConnection } from 'websocket'; // TODO: This is just for the types, not used at any point
import { ErrorCode, Message, RoomOptions, RoomConfig, UserOptions } from './Types';
import { User } from './User';
import { Utility } from './Utility';

type UserMap = {
    [index: string] : User;
};

export class Room {
    private options: RoomOptions;
    private host: User;
    private users: UserMap;
    private id: string;
    constructor(id: string, host: WebSocketConnection, options: RoomConfig) {
        options.name = options.name || '';
        options.password = options.password || '';
        options.size = options.size || 8;
        options.remote = options.remote || false;

        this.options = <RoomOptions> options;

        this.id = id;
        this.users = {};

        const message: Message = {
            event: 'created',
            data: [id],
            sender: '',
            recipient: []
        };

        this.host = new User('', host);
        this.host.send(message);
    }

    public join(socket: WebSocketConnection, data: UserOptions): ErrorCode {
        let id: string;

        do {
            id = Utility.generateString();
        } while (this.users[id] !== undefined);

        const user: User = new User(id, socket);

        const error: ErrorCode = this.add(user);

        if (error === ErrorCode.SUCCESS) {
            const message: Message = {
                event: 'joined',
                data: [this.id + user.getID(), data.name], //TODO: Generalise
                sender: '',
                recipient: ['']
            };
            user.send(message);

            this.host.send(message);
        }

        return error;
    }

    public add(user: User): ErrorCode {
        if (this.size() === this.options.size) {
            return ErrorCode.ROOMFULL;
        }

        const id: string = user.getID();
        this.users[id] = user;

        return ErrorCode.SUCCESS;
    }

    public reconnect(connection: WebSocketConnection, id: string): ErrorCode {
        let user: User;
        if (id === this.id) {
            if (this.options.remote) {
                return ErrorCode.MALFORMED;
            }
            user = this.host;
        } else {
            const userID: string = id.slice(4, 8);
            user = this.users[userID];

            if (user === undefined) {
                return ErrorCode.USERNOTFOUND;
            }
        }

        user.reconnect(connection);

        return ErrorCode.SUCCESS;
    }

    public find(userID: string): User | undefined {
        if (userID === this.id) {
            if (this.options.remote) {
                return undefined;
            }

            return this.host;
        }
        const user: User = this.users[userID];

        return user;
    }

    public size(): number {
        return Object.keys(this.users).length;
    }

    public route(message: Message): ErrorCode {
        const users: User[] = [];
        let missingUser = false;
        if (message.sender !== this.id) {
            const origin: User | undefined = this.find(message.sender.slice(4, 8));

            if (origin === undefined) {
                return ErrorCode.USERNOTFOUND;
            }

            this.host.send(message);

            return ErrorCode.SUCCESS;
        }

        message.recipient.forEach((id: string) => {

            const userID: string = id.slice(4, 8);
            const user: User = this.users[userID];

            if (user === undefined) {
                missingUser = true;

                return;
            }

            users.push(user);
        });

        if (missingUser) {
            return ErrorCode.USERNOTFOUND;
        }

        users.forEach((user: User) => {
            user.send(message);
        });

        return ErrorCode.SUCCESS;
    }

    public close(reason: string): void {
        const message: Message = {
            event: 'closed',
            data: [reason],
            sender: this.id,
            recipient: []
        };
        let user: User;
        const userIDs: string[] = Object.keys(this.users);
        userIDs.forEach((id: string): void => {
            user = this.users[id];
            message.recipient = [user.getID()];
            user.send(message);
            user.close();
        });

        message.recipient = [this.id];
        this.host.send(message);
        this.host.close();
    }

    public kick(id: string, reason: string) : ErrorCode {
        const userID: string = id.slice(4, 8);
        const user: User = this.users[userID];

        if (user === undefined) {
            return ErrorCode.USERNOTFOUND;
        }

        const message: Message = {
            event: 'kicked',
            data: [reason],
            sender: this.id,
            recipient: [id]
        };

        user.send(message);

        user.close();

        return ErrorCode.SUCCESS;
    }

    public checkPassword(password: string): boolean {
        if (this.options.password.length === 0) {
            return true;
        }

        return password.localeCompare(this.options.password) === 0;
    }

    public getID(): string {
        return this.id;
    }
}
