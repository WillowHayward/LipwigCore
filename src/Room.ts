/**
 * @author: William Hayward
 */
import { EventManager } from './EventManager';
import { User } from './User';
import { Utility } from './Utility';

type UserMap = {
    [index: string] : User;
};

export class Room extends EventManager {
    private users: UserMap;
    private id: string;
    constructor(id: string) {
        super();
        this.id = id;
        this.users = {};
    }

    public add(user: User): boolean {
        const id: string = user.getID();
        this.users[id] = user;

        return true;
    }

    public size(): number {
        return Object.keys(this.users).length;
    }
}
