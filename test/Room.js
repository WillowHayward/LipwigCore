var assert = require('assert');
const Room = require('../build/Room.js').Room;
const User = require('../build/User.js').User;

let room;
describe('Room', function() {
    beforeEach(function() {
        room = new Room('ABC');
    });
    it('should start empty', function() {
        assert.equal(room.size(), 0);
    });
    it('should allow for users to be added', function() {
        const user1 = new User('A');
        const user2 = new User('B');
        room.add(user1);
        room.add(user2);

        assert.equal(room.size(), 2);
    });
});