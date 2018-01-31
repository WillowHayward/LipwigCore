/**
 * @author: William Hayward
 */
import {EventManager} from './EventManager';
const manager: EventManager = new EventManager();

manager.on('test', (): void => {
    console.log('Hello');
});

manager.emit('test');
manager.emit('not-test');
manager.emit('test');
