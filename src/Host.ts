/**
 * Host of a remote room
 * @author: William Hayward
 */
import { EventManager } from './EventManager';
import { Message } from './Types';

export class Host extends EventManager {
    private id: string;
    constructor(id: string) {
        super();
        this.id = id;
    }

    public getID(): string {
        return this.id;
    }

    public handle(message: Message): void {
        const args: any[] = message.data; // tslint:disable-line:no-any
        args.unshift(message.event);
        args.push(message);

        this.emit.apply(this, args);
    }
}
