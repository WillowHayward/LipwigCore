/**
 * @author: William Hayward
 */
import * as WebSocket from 'websocket';
import { EventManager } from './EventManager';

type Message = {
    event: string;
    data: any[]; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
};

export class User extends EventManager {
    private id: string;
    private socket: WebSocket.connection;
    constructor(id: string, socket: WebSocket.connection) {
        super();
        this.id = id;
        this.socket = socket;
    }

    public getID(): string {
        return this.id;
    }

    public send(message: Message): void {
        this.socket.send(message);
    }
}
