/**
 * @author: William Hayward
 */
// tslint:disable:no-any
// "any" required for public API arguments
type Function = (...args: any[]) => void;
type Callback = {
    once: boolean;
    fn: Function;
    context: object;
};
type FunctionMap = {
    [index: string]: Callback[];
};
export class EventManager {
    private events: FunctionMap;

    constructor() {
        this.events = {};
    }

    public on(event: string, fn: Function, context: object = this): void {
        this.addEvent(event, fn, context, false);
    }

    public once(event: string, fn: Function, context: object = this): void {
        this.addEvent(event, fn, context, true);
    }

    public emit(event: string, ...args: any[]): void {
        const callbacks: Callback[] = this.events[event];
        if (callbacks === undefined) {
            return;
        }

        callbacks.forEach((callback: Callback, index: number, object: Callback[]): void => {
            callback.fn.apply(callback.context, args);
            if (callback.once) {
                object.splice(index, 1);
            }
        });
    }

    public clear(event: string): void {
        delete this.events[event];
    }

    private addEvent(event: string, fn: Function, context: object, once: boolean): void {
        if (this.events[event] === undefined) {
            this.events[event] = [];
        }
        const callback: Callback = {
            once: once,
            fn: fn.bind(context),
            context: context
        };
        this.events[event].push(callback);
    }
}
