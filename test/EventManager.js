var assert = require('assert');
const EventManager = require('../build/EventManager.js').EventManager;
describe('EventManager', function() {
    describe('#on()', function() {
        it('should trigger saved events', function(done) {
            const a = new EventManager();
            a.on('test', function() {
                done();
            });

            a.emit('test');
        });

        it('should not trigger non-existent events', function() {
            const a = new EventManager();
            a.emit('test');
        });

        it('should allow multiple events to be triggered', function() {
            let count = 0;
            const a = new EventManager();
            a.on('first', function() {
                count++;
            });

            a.on('second', function() {
                count++;
            });

            a.emit('first');
            a.emit('second');

            assert.equal(count, 2);
        });

        it('should allow events to be triggered from different event managers', function() {
            let count = 0;
            const a = new EventManager();
            const b = new EventManager();
            a.on('increment', function() {
                count++;
            });

            b.on('add', function() {
                count++;
            });

            a.emit('increment');
            b.emit('add');
            
            assert.equal(count, 2);
        });
        
        it('should not share events between managers', function() {
            let count = 0;
            const a = new EventManager();
            const b = new EventManager();
            a.on('add', function() {
                count++;
            });

            b.on('add', function() {
                count++;
            });

            a.emit('add');
            
            assert.equal(count, 1);
        });
    });
  });