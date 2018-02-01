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

        it('should allow events to be triggered multiple times', function() {
            let count = 0;
            const a = new EventManager();
            a.on('add', function() {
                count++;
            });

            a.emit('add');
            a.emit('add');

            assert.equal(count, 2);
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

        it('should allow multiple functions within the same event', function() {
            var count1 = 0;
            var count2 = 0;
            const a = new EventManager();
            a.on('add', function() {
                count1++;
            });

            a.on('add', function() {
                count2++;
            });

            a.emit('add');

            assert.equal(count1, 1);
            assert.equal(count2, 1);
        });
    });
    describe('#once()', function() {
        it('should trigger saved events', function(done) {
            const a = new EventManager();
            a.once('test', function() {
                done();
            });

            a.emit('test');
        });
        
        it('should trigger saved events exactly once', function() {
            let count = 0;
            const a = new EventManager();
            a.once('add', function() {
                count++;
            });

            a.emit('add');
            a.emit('add');

            assert.equal(count, 1);
        });

        it('should pair with .on() without replacing it', function() {
            let count = 0;
            const a = new EventManager();
            a.once('double', function() {
                count *= 2;
            });
            
            a.on('add', function() {
                count++;
            });

            a.emit('add');
            a.emit('double');
            a.emit('double');
            assert.equal(count, 2);
        })
    });
  });