var assert = require('assert');
const Room = require('../lib/Room.js').Room;
const User = require('../lib/User.js').User;

let room;
describe('Room', function() {
    beforeEach(function() {
        room = new Room('ABC');
    });
    it('should start empty', function() {
        assert.equal(room.size(), 0);
    });
    it('should allow for users to be added', function(done) {
        // TODO: Rewrite these
        done();
        const user1 = new User('A');
        const user2 = new User('B');
        room.add(user1);
        room.add(user2);

        assert.equal(room.size(), 2);
    });
});