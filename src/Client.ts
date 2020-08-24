/**
 * Client of a remote room
 * @author: William Hayward
 */
import { EventManager } from 'lipwig-events';
import { Message, ErrorCode } from './Types';
import { User } from './User';

export class Client extends EventManager {
    private user: User;
    constructor(user: User) {
        super();
        this.user = user;
    }

    public handle(message: Message): void {
        const args: unknown[] = message.data;
        args.push(message);
     
        this.emit(message.event, ...args);
    }

    public send(event: string, ...args: unknown[]): void {
        const message: Message = {
            event: event,
            data: [...args],
            sender: this.user.getID(),
            recipient: []
        };

        this.user.send(message);
    }
}
