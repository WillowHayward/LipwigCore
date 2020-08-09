/**
 * @author: William Hayward
 * @description: A stub class to allow for testing client connections
 */
import * as WebSocket from 'websocket';
import { EventManager } from './EventManager';
import { Message, ErrorCode } from './Types';

export class Stub extends EventManager<ErrorCode> {
    private socket: WebSocket.connection | null;
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
        const rawMessage = <string> evt.utf8Data;
        const message: Message = JSON.parse(rawMessage);
        const args: unknown[] = message.data;
        args.push(message);
        this.emit(message.event, ...args);
    }
}
