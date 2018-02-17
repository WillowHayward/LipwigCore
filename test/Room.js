var assert = require('assert');
const Room = require('../lib/Room.js').Room;
const User = require('../lib/User.js').User;

let room;
let lw;
describe('Room', function() {

    before(function(done) {
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        });
    });

    beforeEach(function() {
        room = new Room('ABC');
    })

    after(function() {
        lw.exit();
    });

    function create() {
        const host = new Stub('ws://localhost:8080');
        host.on('connected', function() {
            const message = {
                event: 'create',
                data: [],
                sender: '',
                recipient: []
            };

            host.send(message);
        });

        return host;
    }

    function join(code) {
        const client = new Stub('ws://localhost:8080');
        client.on('connected', function() {
            const message = {
                event: 'join',
                data: [code],
                sender: '',
                recipient: []
            };
            client.send(message);
        });

        return client;
    }

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

    it('should have a set size', function(done) {
        // TODO: Write this
        done();
    });
});