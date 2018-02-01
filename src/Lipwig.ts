/**
 * @author: William Hayward
 */
import {server as WebSocket} from 'websocket';
import {Room} from './Room';
import {User} from './User';
export class Lipwig {
    private ws: WebSocket;
    constructor() {
        this.ws = new WebSocket();
    }

    private newConnection(): void {
        return;
    }
}
