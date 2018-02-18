const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;

describe('User', function() {
    let lw;
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

    describe('kick', function() {
        it('should kick users', function(done) {
            host = create();
            host.on('created', function(code) {
                host.id = code;
                client = join(code);

                client.on('kicked', function() {
                    done();
                });
            });

            host.on('joined', function(id) {
                const message = {
                    event: 'kick',
                    data: [id, ''],
                    sender: host.id,
                    recipient: [id]
                }
                host.send(message);
            });
        });
    })
})