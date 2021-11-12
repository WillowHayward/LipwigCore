import * as assert from 'assert';
import { Lipwig } from '../src/Lipwig';
import { Stub } from '../src/Stub';

import { 
    Message, 
    RoomConfig,
    testConfig as config 
} from '../src/Types';
const url = 'ws://localhost:' + config.port;

describe('Admin', function() {
    let lw: Lipwig;
    before(function(done) {
        console.log('Test starting at: ' + new Date());
        const lw = new Lipwig(config);
        lw.on('started', function() {
            done();
        });
    });

    after(function(done) {
        this.timeout(0);
        lw.exit();
        lw.on('closed', done);
    });

    function joinAdmin(options: {[index:string]:string} = {}) {
        const admin = new Stub(url);
        admin.on('connection', function() {
            const message = {
                event: 'admin-join',
                data: [options],
                sender: '',
                recipient: [],
            };
            admin.send(message);
        });

        return admin;
    }

    function create(options: RoomConfig = {}) {
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

    function join(code: string, data: {[index:string]:string} = {}) {
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

    describe('admin', function() {
        it('should join the admin room', function(done) {
            const admin = joinAdmin();
            admin.on('admin-joined', function() {
                done();
            });
        })

        it('should receive messages of newly created rooms', function() {
            //return new Promise(
            const admin = joinAdmin();

            admin.on('admin-joined', function() {
                
            });

            admin.on('admin-message', function(message: Message) {
                assert.equal(message.event, 'created');
                assert.equal(message.data[0], 'created');
            });

        });
    });
});
