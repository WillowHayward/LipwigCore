/**
 * @author: William Hayward
 */
type EmptyFunction = () => void;
type FunctionMap = {
    [index: string]: EmptyFunction[];
};
export class EventManager {
    private events: FunctionMap;
    private singleEvents: FunctionMap;
    // TODO: Merge these down to one map to maintain the event listener order
    constructor() {
        this.events = {};
        this.singleEvents = {};
    }

    public on(event: string, fn: EmptyFunction, context: object = this): void {
        if (this.events[event] === undefined) {
            this.events[event] = [];
        }
        this.events[event].push(fn.bind(context));
    }

    public once(event: string, fn: EmptyFunction, context: object = this): void {
        if (this.singleEvents[event] === undefined) {
            this.singleEvents[event] = [];
        }
        this.singleEvents[event].push(fn.bind(context));
    }

    public emit(event: string): void {
        const functions: EmptyFunction[] = this.events[event];
        if (functions !== undefined) {
            for (const fn of functions) {
                fn();
            }
        }

        const singleFunctions: EmptyFunction[] = this.singleEvents[event];
        this.singleEvents[event] = [];
        if (singleFunctions !== undefined) {
            for (const fn of singleFunctions) {
                fn();
            }
        }

    }
}
