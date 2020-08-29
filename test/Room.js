var assert = require('assert');
const Room = require('../lib/Room.js').Room;
const User = require('../lib/User.js').User;
const Lipwig = require('../lib/Lipwig.js');
const ErrorCode = require('../lib/Types.js').ErrorCode;
const Stub = require('../lib/Stub.js').Stub;
const config = require('../lib/Types').testConfig;
const url = 'ws://localhost:' + config.port;

let room;
let lw;
describe('Room', function() {
    let lw;
    before(function(done) {
        lw = new Lipwig(config);
        lw.on('started', function() {
            done();
        });
    });

    beforeEach(function() {
        //room = new Room('ABC');
    })
    
    after(function(done) {
        lw.exit();
        lw.on('closed', done);
    });

    function create(options) {
        if (options === undefined) {
            options = {};
        }

        const host = new Stub(url);
        host.on('connected', function() {
            const message = {
                event: 'create',
                data: [options],
                sender: '',
                recipient: []
            };

            host.send(message);
        });

        return host;
    }

    function join(code, data) {
        if (data === undefined) {
            data = {};
        }
        const client = new Stub(url);
        client.on('connected', function() {
            const message = {
                event: 'join',
                data: [code, data],
                sender: '',
                recipient: []
            };
            client.send(message);
        });

        return client;
    }

    it('should start empty', function() {
        //assert.equal(room.size(), 0);
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

    it('should require the correct password to join', function(done) {
        const host = create({
            password: 'pass'
        });
        host.on('created', function(code) {
            const client = join(code, {
                password: 'pass'
            });
            client.on('joined', function() {
                done();
            });
        });
    });

    it('should block join attempts with an incorrect password', function(done) {
        const host = create({
            password: 'pass'
        });
        host.on('created', function(code) {
            const client = join(code, {
                password: 'not pass'
            });

            client.on('error', function(error) {
                if (error === ErrorCode.INCORRECTPASSWORD) {
                    done();
                }
            });
        });
    });

    it('should ignore passwords on rooms without passwords', function(done) {
        const host = create();
        host.on('created', function(code) {
            const client = join(code, {
                password: 'pass'
            });

            client.on('joined', function() {
                done();
            });
        });

    });
});
