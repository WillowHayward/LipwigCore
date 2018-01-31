/**
 * @author: William Hayward
 */
type EmptyFunction = () => void;
type FunctionMap = {
    [index: string]: EmptyFunction;
};
export class EventManager {
    private events: FunctionMap;
    constructor() {
        this.events = {};
    }

    public on(event: string, fn: EmptyFunction, context: object = this): void {
        this.events[event] = fn.bind(context);
    }

    public emit(event: string): void {
        const fn: EmptyFunction = this.events[event];
        if (fn === undefined) {
            return;
        }
        fn();
    }
}
