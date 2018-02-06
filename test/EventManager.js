var assert = require('assert');
const EventManager = require('../build/EventManager.js').EventManager;
let manager = null;
let count = 0;
describe('EventManager', function() {
    beforeEach(function() {
        manager = new EventManager();
        count = 0;
    });

    describe('#on()', function() {
        it('should trigger saved events', function(done) {
            manager.on('test', function() {
                done();
            });

            manager.emit('test');
        });

        it('should allow events to be triggered multiple times', function() {
            manager.on('add', function() {
                count++;
            });

            manager.emit('add');
            manager.emit('add');

            assert.equal(count, 2);
        });

        it('should not trigger non-existent events', function() {
            manager.emit('test');
        });

        it('should allow multiple events to be triggered', function() {
            manager.on('first', function() {
                count++;
            });

            manager.on('second', function() {
                count++;
            });

            manager.emit('first');
            manager.emit('second');

            assert.equal(count, 2);
        });

        it('should allow events to be triggered from different event managers', function() {
            const secondManager = new EventManager();
            manager.on('increment', function() {
                count++;
            });

            secondManager.on('add', function() {
                count++;
            });

            manager.emit('increment');
            secondManager.emit('add');
            
            assert.equal(count, 2);
        });

        it('should not share events between managers', function() {
            const secondManager = new EventManager();
            manager.on('add', function() {
                count++;
            });

            secondManager.on('add', function() {
                count++;
            });

            manager.emit('add');
            
            assert.equal(count, 1);
        });

        it('should allow multiple functions within the same event', function() {
            var count1 = 0;
            var count2 = 0;

            manager.on('add', function() {
                count1++;
            });

            manager.on('add', function() {
                count2++;
            });

            manager.emit('add');

            assert.equal(count1, 1);
            assert.equal(count2, 1);
        });

        it('should maintain the order of events as added', function() {
            manager.on('change', function() {
                count++;
            });

            manager.on('change', function() {
                count *= 10;
            });

            manager.emit('change');

            assert.equal(count, 10);
        });
    });
    describe('#once()', function() {
        it('should trigger saved events', function(done) {
            manager.once('test', function() {
                done();
            });

            manager.emit('test');
        });
        
        it('should trigger saved events exactly once', function() {
            manager.once('add', function() {
                count++;
            });

            manager.emit('add');
            manager.emit('add');

            assert.equal(count, 1);
        });

        it('should pair with .on() without replacing it', function() {
            manager.once('double', function() {
                count *= 2;
            });
            
            manager.on('add', function() {
                count++;
            });

            manager.emit('add');
            manager.emit('double');
            manager.emit('double');
            assert.equal(count, 2);
        });
    });
    describe('#emit()', function() {
        it('should do nothing without event to trigger', function() {
            manager.on('add', function() {
                count++;
            });
            
            manager.emit();
        })
        it('should emit without function parameters', function() {
            manager.on('add', function() {
                count++;
            });
            manager.emit('add');

            assert.equal(count, 1);
        });
        it('should allow parameters to be passed', function() {
            manager.on('add', function(amount) {
                count += amount;
            })

            manager.emit('add', 5);

            assert.equal(count, 5);
        });

        it('should allow optional parameters', function() {
            manager.on('add', function(amount = 1) {
                count += amount;
            });

            manager.emit('add');
            assert.equal(count, 1);
        });

        it('should allow multiple parameters', function() {
            manager.on('add', function(first, second) {
                count += first;
                count += second;
            });

            manager.emit('add', 1, 3);
            assert.equal(count, 4);
        })
    });
  });