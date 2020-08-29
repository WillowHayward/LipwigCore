const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;

const port = require('../lib/Types').defaultConfig.port;
const url = 'ws://localhost:' + port;

let lw;
describe('Stub', function() {
    before(function(done) {
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        });
    });
    
    after(function(done) {
        lw.exit();
        lw.on('closed', done);
    });

    it('should be able to connect', function(done) {
        const user = new Stub(url);
        user.on('connected', function() {
            done();
        });
    });

    it('should be able to create rooms', function(done) {
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

        host.on('created', function(code) {
            done();
        });
    });

    it('should be able to join rooms', function(done) {
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

        host.on('created', function(code) {
            const client = new Stub(url);
            client.on('connected', function(id) {
                const message = {
                    event: 'join',
                    data: [code],
                    sender: '',
                    recipient: []
                };
                client.send(message);
                client.on('joined', function() {
                    done();
                });
                client.on('error', function(code) {
                  done(code);
                });
            });
        });
    });
});
