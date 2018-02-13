const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;
let lw;
describe('Stub', function() {
    before(function(done) {
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        });
    });

    after(function() {
        lw.exit();
    });

    it('should be able to connect', function(done) {
        const user = new Stub('ws://localhost:8080');
        user.on('connected', function() {
            done();
        });
    });

    it('should be able to create rooms', function(done) {
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

        host.on('created', function(code) {
            done();
        });
    });

    it('should be able to join rooms', function(done) {
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

        host.on('created', function(code) {
            const client = new Stub('ws://localhost:8080');
            client.on('connected', function() {
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
            });
        });
    });
});