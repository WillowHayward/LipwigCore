var assert = require('assert');
const Lipwig = require('../lib/Lipwig.js');
const ErrorCode = require('../lib/Types.js').ErrorCode;
const Stub = require('../lib/Stub.js').Stub;

describe('Remote', function() {
    let lw;

    beforeEach(function(done) {
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        });
    });
    
    afterEach(function(done) {
        this.timeout(0);
        lw.exit();
        lw.on('closed', done);
    });



    function create(options) {
        options = options || {};

        const host = new Stub('ws://localhost:8080');
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
        const client = new Stub('ws://localhost:8080');
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

    
    it('should create remote rooms', function(done) {
        const user = create({
            remote: true
        });
        user.on('created', function() {
            done();
        });
    });

    it('should emit an event when a remote room is created', function(done) {
        const user = create({
            remote: true
        });

        lw.on('created', function() {
            done();
        });
    });

    it('should pass messages between the room and the creator', function(done) {
        const user = create({
            remote: true
        });

        user.on('created', function(code, id) {
            this.id = id;
        });

        user.on('ping', function() {
            const pong = {
                event: 'pong', 
                data: [],
                sender: this.id,
                recipient: []
            }
            this.send(pong);
        });

        lw.on('created', function(host, creator) {            
            host.on('pong', function() {
                done();
            });

            creator.send('ping');
        });
    });

    it('should allow clients to join', function(done) {
        const user = create({
            remote: true
        });

        user.on('created', function(code) {
            const client = join(code);
        });

        lw.on('created', function(host, creator) {            
            host.on('joined', function() {
                done();
            });
        });
    });

    it('should allow clients to join and exchange messages', function(done) {
        const user = create({
            remote: true
        });

        user.on('created', function(code) {
            const client = join(code);

            client.on('joined', function(id) {
                const message = {
                    event: 'ping',
                    data: [],
                    sender: id,
                    recipient: []
                };
                client.send(message);
            });

            client.on('pong', function() {
                done();
            });
        });

        lw.on('created', function(host, creator) {
            host.on('ping', function(user) {
                user.send('pong');
            });
        });
    });
});