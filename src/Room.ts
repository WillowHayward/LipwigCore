/**
 * @author: William Hayward
 */
import { connection as WebSocketConnection } from 'websocket'; // TODO: This is just for the types, not used at any point
import { Client } from './Client';
import { Host } from './Host';
import { ErrorCode, Message, RoomOptions, UserOptions } from './Types';
import { User } from './User';
import { Utility } from './Utility';

type UserMap = {
    [index: string] : User;
};

export class Room {
    private options: RoomOptions;
    private host: User;
    private remoteHost: Host;
    private creator: User;
    private users: UserMap;
    private id: string;
    constructor(id: string, host: WebSocketConnection, options: RoomOptions) {
        options.name = options.name || '';
        options.password = options.password || '';
        options.size = options.size || 8;
        options.remote = options.remote || false;

        this.options = options;

        this.id = id;
        this.users = {};

        const message: Message = {
            event: 'created',
            data: [id],
            sender: '',
            recipient: []
        };

        if (this.options.remote) {
            const userID: string = Utility.generateString();
            this.creator = new User(userID, host);
            this.add(this.creator);
            message.data.push(id + userID);
            this.users[userID] = this.creator;
            this.creator.send(message);
            this.host = null;
            this.remoteHost = new Host(id);

            message.data = [this.remoteHost, this.creator.getClient()];
            this.remoteHost.handle(message);
        } else {
            this.host = new User('', host);
            this.host.send(message);
        }
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
                data: [this.id + user.getID(), data],
                sender: '',
                recipient: ['']
            };
            user.send(message);

            if (this.options.remote) {
                message.data[0] = user;
                this.remoteHost.handle(message);
            } else {
                this.host.send(message);
            }
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

    public find(userID: string): User {
        if (userID === this.id) {
            if (this.options.remote) {
                return null;
            }

            return this.host;
        }
        const user: User = this.users[userID];

        if (user === undefined) {
            return null;
        }

        return user;
    }

    public size(): number {
        return Object.keys(this.users).length;
    }

    public getRemoteHost(): Host {
        return this.remoteHost;
    }

    public getRemoteCreator(): Client {
        return this.creator.getClient();
    }

    public isRemote(): boolean {
        return this.options.remote;
    }

    public route(message: Message): ErrorCode {
        const users: User[] = [];
        let missingUser: boolean = false;
        if (message.sender !== this.id) {
            const origin: User = this.find(message.sender.slice(4, 8));

            if (origin === null) {
                return ErrorCode.USERNOTFOUND;
            }

            if (this.options.remote) {
                message.data.unshift(origin.getClient());
                this.remoteHost.handle(message);
            } else {
                this.host.send(message);
            }

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
        if (this.options.remote) {
            this.remoteHost.handle(message);
        } else {
            this.host.send(message);
            this.host.close();
        }
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
