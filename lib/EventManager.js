"use strict";
exports.__esModule = true;
exports.EventManager = void 0;
var EventManager = (function () {
    function EventManager() {
        this.events = {};
    }
    EventManager.prototype.on = function (event, fn, context) {
        if (context === void 0) { context = { object: this }; }
        this.addEvent(event, fn, context, false);
    };
    EventManager.prototype.once = function (event, fn, context) {
        if (context === void 0) { context = { object: this }; }
        this.addEvent(event, fn, context, true);
    };
    EventManager.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var callbacks = this.events[event];
        if (callbacks === undefined) {
            return;
        }
        callbacks.forEach(function (callback, index, object) {
            callback.fn.apply(callback, args);
            if (callback.once) {
                object.splice(index, 1);
            }
        });
    };
    EventManager.prototype.clear = function (event) {
        delete this.events[event];
    };
    EventManager.prototype.contains = function (event) {
        return event in this.events;
    };
    EventManager.prototype.get = function (event) {
        return this.events[event][0].fn;
    };
    EventManager.prototype.addEvent = function (event, fn, context, once) {
        if (this.events[event] === undefined) {
            this.events[event] = [];
        }
        var callback = {
            once: once,
            fn: fn.bind(context.object),
            context: context
        };
        this.events[event].push(callback);
    };
    return EventManager;
}());
exports.EventManager = EventManager;
