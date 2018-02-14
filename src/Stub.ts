/**
 * @author: William Hayward
 * @description: A stub class to allow for testing client connections
 */
import * as WebSocket from 'websocket';
import { EventManager } from './EventManager';
import { Message } from './Types';

export class Stub extends EventManager {
    private socket: WebSocket.connection;
    private queue: Message[];
    constructor(url: string) {
        super();
        const client: WebSocket.client = new WebSocket.client();
        client.connect(url);

        this.socket = null;
        this.queue = [];

        client.on('connect', (connection: WebSocket.connection): void => {
            this.socket = connection;
            this.socket.on('message', (evt: WebSocket.IMessage): void => {
                this.handle(evt);
            });
            this.emit('connected');

            this.queue.forEach((message: Message): void => {
                this.send(message);
            });
        });
    }

    public send(message: Message): void {
        if (this.socket === null) {
            this.queue.push(message);

            return;
        }
        const text: string = JSON.stringify(message);
        this.socket.send(text);
    }

    public handle(evt: WebSocket.IMessage): void {
        const message: Message = JSON.parse(evt.utf8Data);
        const args: any[] = message.data; // tslint:disable-line:no-any
        args.unshift(message.event);
        args.push(message);
        this.emit.apply(this, args);
    }
}
