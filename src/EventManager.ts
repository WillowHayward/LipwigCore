/**
 * @author: William Hayward
 */
/* eslint-disable */
//export type Callback = <T>(...args: unknown[]) => T;
// TODO: There must be a better way than using the Function type, but the above line
// CONT: Causes type issues across the board
export type Callback = Function;
/* eslint-enable */
export type CallbackEntry = {
    once: boolean;
    fn: Callback;
    context: Record<string, unknown>;
};
export type CallbackMap = {
    [index: string]: CallbackEntry[];
};

export class EventManager<T> {
    private events: CallbackMap;

    constructor() {
        this.events = {};
    }

    public on(event: string, fn: Callback, context: Record<string, unknown> = {object: this}): void {
        this.addEvent(event, fn, context, false);
    }

    public once(event: string, fn: Callback, context: Record<string, unknown> = {object: this}): void {
        this.addEvent(event, fn, context, true);
    }

    public emit(event: string, ...args: unknown[]): void {
        const callbacks: CallbackEntry[] = this.events[event];
        if (callbacks === undefined) {
            return;
        }

        callbacks.forEach((callback: CallbackEntry, index: number, object: CallbackEntry[]): void => {
            callback.fn(...args);
            //NOTE: Context is bound in addEvent, so this should still work
            //callback.fn.apply(callback.context, args);
            if (callback.once) {
                object.splice(index, 1);
            }
        });
    }

    public clear(event: string): void {
        delete this.events[event];
    }

    public contains(event: string): boolean {
      return event in this.events;
    }

    public get(event: string): Callback {
      return this.events[event][0].fn;
    }

    private addEvent(event: string, fn: Callback, context: Record<string, unknown>, once: boolean): void {
        if (this.events[event] === undefined) {
            this.events[event] = [];
        }
        const callback: CallbackEntry = {
            once: once,
            fn: fn.bind(context.object),
            context: context
        };
        this.events[event].push(callback);
    }
}
