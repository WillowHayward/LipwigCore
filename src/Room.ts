/**
 * @author: William Hayward
 */
import { connection as WebSocketConnection } from 'websocket'; // TODO: This is just for the types, not used at any point
import { ErrorCode } from './ErrorCode';
import { User } from './User';
import { Utility } from './Utility';

type UserMap = {
    [index: string] : User;
};

type Message = {
    event: string;
    data: any; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
};

export class Room {
    // TODO: These are the properties. Make this a constructor parameter
    private maxSize: number = 9;
    private host: User;

    private users: UserMap;
    private id: string;
    constructor(id: string, host: WebSocketConnection) {
        this.id = id;
        this.users = {};
        if (host !== undefined) {
            this.host = new User('', host);
            const message: Message = {
                event: 'created',
                data: [id],
                sender: '',
                recipient: []
            };
            this.host.send(message);
        }
    }

    public join(socket: WebSocketConnection): ErrorCode {
        let id: string;

        do {
            id = Utility.generateString();
        } while (this.users[id] !== undefined);

        const user: User = new User(id, socket);

        const error: ErrorCode = this.add(user);

        if (error === ErrorCode.SUCCESS) {
            const message: Message = {
                event: 'joined',
                data: [this.id + user.getID()],
                sender: '',
                recipient: ['']
            };
            user.send(message);
            this.host.send(message);
        }

        return error;
    }

    public add(user: User): ErrorCode {
        if (this.size() === this.maxSize) {
            return ErrorCode.ROOMFULL;
        }

        const id: string = user.getID();
        this.users[id] = user;

        return ErrorCode.SUCCESS;
    }

    public reconnect(connection: WebSocketConnection, id: string): ErrorCode {
        let user: User;
        if (id === this.id) {
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

    public route(message: Message): ErrorCode {
        const users: User[] = [];
        let missingUser: boolean = false;
        if (message.sender !== this.id) {
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
            data: [reason], // TODO: Close reason should go here
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

    public getID(): string {
        return this.id;
    }
}
