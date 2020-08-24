/**
 * Host of a remote room
 * @author: William Hayward
 */
import { EventManager } from 'lipwig-events';
import { Message, ErrorCode } from './Types';

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
        const args: unknown[] = message.data;
        args.push(message);

        this.emit(message.event, ...args);
    }
}
