/**
 * Client of a remote room
 * @author: William Hayward
 */
import { EventManager } from './EventManager';
import { Message } from './Types';
import { User } from './User';

export class Client extends EventManager {
    private user: User;
    constructor(user: User) {
        super();
        this.user = user;
    }

    public handle(message: Message): void {
        const args: any[] = message.data; // tslint:disable-line:no-any
        args.unshift(message.event);
        args.push(message);

        this.emit.apply(this, args);
    }

    public send(event: string, ...args: any[]): void { // tslint:disable-line:no-any
        const message: Message = {
            event: event,
            data: args,
            sender: this.user.getID(),
            recipient: []
        };

        this.user.send(message);
    }
}
