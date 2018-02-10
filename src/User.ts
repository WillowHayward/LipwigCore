/**
 * @author: William Hayward
 */
import * as WebSocket from 'websocket';

type Message = {
    event: string;
    data: any[]; // tslint:disable-line:no-any
    recipient: string[];
    sender: string;
};

export class User {
    private id: string;
    private socket: WebSocket.connection;
    private queue: Message[];
    constructor(id: string, socket: WebSocket.connection) {
        this.id = id;
        this.socket = socket;

        this.socket.on('close', (code: number, desc: string): void => {
            this.socket.removeAllListeners();
            this.socket = null;
            this.queue = [];
        });
    }

    public getID(): string {
        return this.id;
    }

    public send(message: Message): void {
        if (this.socket === null) {
            this.queue.push(message);

            return;
        }
        const text: string = JSON.stringify(message);
        this.socket.sendUTF(text);
    }

    public reconnect(socket: WebSocket.connection): void {
        this.socket = socket;

        const reconnect: Message = {
            event: 'reconnected',
            data: [],
            sender: '',
            recipient: [this.id]
        };

        this.send(reconnect);

        this.queue.forEach((message: Message): void => {
            this.send(message);
        });

        this.queue = [];
    }
}
