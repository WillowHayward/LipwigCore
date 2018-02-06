/**
 * @author: William Hayward
 */
import { EventManager } from './EventManager';
export class User extends EventManager {
    private id: string;
    constructor(id: string) {
        super();
        this.id = id;
    }

    public getID(): string {
        return this.id;
    }
}
