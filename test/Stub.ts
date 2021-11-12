import { Lipwig } from '../src/Lipwig';
import { Stub } from '../src/Stub';
import { 
    ErrorCode,
    testConfig as config 
} from '../src/Types';

const url = 'ws://localhost:' + config.port;

describe('Stub', function() {
    let lw: Lipwig;
    before(function(done) {
        lw = new Lipwig(config);
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

        host.on('created', function() {
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

        host.on('created', function(code: string) {
            const client = new Stub(url);
            client.on('connected', function(id: string) {
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
                client.on('error', function(code: ErrorCode) {
                  done(code);
                });
            });
        });
    });
});
