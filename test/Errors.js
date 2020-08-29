const ErrorCode = require('../lib/Types.js').ErrorCode;
const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;
const config = require('../lib/Types').testConfig;
const url = 'ws://localhost:' + config.port;

let lw;

describe('Errors', function() {
    before(function(done) {
        lw = new Lipwig(config);
        lw.on('started', function() {
            done();
        })
    });
    
    after(function(done) {
        lw.exit();
        lw.on('closed', done);
    });

    function create() {
        const host = new Stub(url);
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
        const client = new Stub(url);
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
    
    describe(ErrorCode.MALFORMED + ' - Malformed', function() {
        it('should catch completely malformed messages', function(done) {
            const message = 'sdsdsd88wdwe';
            const host = new Stub(url);
            host.on('connected', function() {
                host.send(message);
            });
            host.on('error', function(code) {
                if (code === ErrorCode.MALFORMED) {
                    done();
                }
            });
        });
    });
    describe(ErrorCode.ROOMNOTFOUND + ' - Room not Found', function() {
        it('should throw an error when trying to join a non-existent room', function(done) {
            const client = new Stub(url)
            client.on('connected', function() {
                const message = {
                    event: 'join',
                    data: ['ABCD'],
                    sender: '',
                    recipient: []
                };
                client.send(message);
            });

            client.on('error', function(code) {
                if (code === ErrorCode.ROOMNOTFOUND) {
                    done();
                }
            })
        });
    });
    describe(ErrorCode.ROOMFULL + ' - Room Full', function() {

    });
    describe(ErrorCode.USERNOTFOUND + ' - User Not Found', function() {

    });
    describe(ErrorCode.INSUFFICIENTPERMISSIONS + ' - Insufficient Permission', function() {
        it('should not allow users to kick other users', function(done) {
            done();
            const host = new Stub(url);
            host.on('connected', function() {
                let message = {
                    event: 'create',
                    data: [],
                    sender: '',
                    recipient: []
                }
                host.send(message);
            });

            host.on('created', function(code) {
                user1 = join(code);
                user2 = join(code);

                user2.on('joined', function(id) {
                    message = {
                        event: 'kick',
                        data: [id, 'testing'],
                        sender: code,
                        recipient: [id]
                    };
                    user1.send(message);
                });

                user1.on('error', function(code) {
                    //if (code === ErrorCode.INSUFFICIENTPERMISSIONS) {
                     //   done(code);
                    //}
                })
            });
        });
    });
});
