/**
 * @author: William Hayward
 */
import * as http from 'http';
import * as WebSocket from 'websocket';
import { Room } from './Room';
import { User } from './User';
export class Lipwig {
    private ws: WebSocket.server;
    constructor(port: number = 8080) {
        const server: http.Server = http.createServer();
        server.listen(port, () => {
            console.log('Listening on ' + port);
        });

        this.ws = new WebSocket.server({
            httpServer: server,
            autoAcceptConnections: false
        });

        this.ws.on('request', this.newRequest);
    }

    private newRequest(request: WebSocket.request): void {
        return;
    }

    private isOriginAllowed(origin: string): boolean {
        // TODO: Origin checking
        return true;
    }

    private newConnection(): void {
        return;
    }
}

const lw: Lipwig = new Lipwig();
