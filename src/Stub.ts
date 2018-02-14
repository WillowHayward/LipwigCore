/**
 * @author: William Hayward
 * @description: A stub class to allow for testing client connections
 */
import * as WebSocket from 'websocket';
import { EventManager } from './EventManager';
import { Message } from './Types';

export class Stub extends EventManager {
    private socket: WebSocket.connection;
    constructor(url: string) {
        super();
        const client: WebSocket.client = new WebSocket.client();
        client.connect(url);

        client.on('connect', (connection: WebSocket.connection): void => {
            this.socket = connection;
            this.socket.on('message', (evt: WebSocket.IMessage): void => {
                this.handle(evt);
            });
            this.emit('connected');
        });
    }

    public send(message: Message): void {
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
