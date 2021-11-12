import { Lipwig } from '../src/Lipwig';
import { User } from '../src/User';
import { Room } from '../src/Room';
import { Stub } from '../src/Stub';

import { 
    ErrorCode,
    Message, 
    RoomConfig,
    testConfig as config 
} from '../src/Types';
const url = 'ws://localhost:' + config.port;

describe('Stress', function() {
    this.timeout(0);
    let lw: Lipwig;

    before(function(done) {
        console.log('Test starting at: ' + new Date());
        lw = new Lipwig(config);
        lw.on('started', function() {
            done();
        });
    });
    
    after(function(done) {
        this.timeout(0);
        lw.exit();
        lw.on('closed', done);
    });


    function create(options: RoomConfig = {}): Stub {
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

    function join(code: string, data: {[index:string]:string} = {}): Stub {
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

    let report = false;

    function createRooms(remaining: number, done: (...args: unknown[]) => void, codes: string[] = []) {
        const host: Stub = create();
        const message: Message = {
            event: 'pong',
            sender: '',
            data: [],
            recipient: []
        };
        host.on('created', function(code: string) {
            codes.push(code);
            message.sender = code;

            remaining--;
            if (remaining) {
                createRooms(remaining, done, codes);
            } else {
                if (report) {
                    console.log('Rooms created');
                }
                done(codes);
            }
        });

        host.on('ping', function(count: number, message: Message) {
            message.data[0] = count;
            message.recipient[0] = message.sender;
            host.send(message);
        });
    }

    function joinRooms(remaining: number, codes: string[] = [], done: (...args: unknown[]) => void, users: Stub[] = []) {
        if (remaining === 0) {
            done(users);
        }
        const code = codes[remaining % codes.length];
        const client = join(code);
        client.on('joined', function(id: string) {
            client.id = id;
            users.push(client);
            remaining--;
            if (remaining) {
                joinRooms(remaining, codes, done, users);
            } else {
                if (report) {
                    console.log('Rooms joined');
                }
                done(users);
            }
        });

        client.on('pong', function(count: number) {
            count++;
            if (count === this.total) {
                this.emit('finished');
            } else {
                this.message.data[0] = count;
                this.send(this.message);
            }
        });
    }

    function stress(rooms: number,
                    users: number,
                    messages: number,
                    done: (...args: unknown[]) => void,
                    roomFunction: (rooms: number, callback: (codes: string[], creator: Stub) => void) => void
                   ) {
        const completed = [];
        let progress = 0;
        let expected = rooms * users;
        roomFunction(rooms, function(codes: string[], creator: Stub) {
            if (creator !== undefined) {
                expected = rooms * users - 1;
            }
            joinRooms(expected, codes, function(clients: Stub[]) {
                if (creator !== undefined) {
                    clients.push(creator);
                }
                clients.forEach(function(client: Stub, index) {
                    completed[index] = false;
                    const message = {
                        event: 'ping',
                        data: [0],
                        sender: client.id,
                        recipient: []
                    }

                    client.on('finished', function() {
                        completed[index] = true;
                        progress++;
                        if (report && progress / expected * 100 % 10 === 0) {
                            console.log(progress / expected * 100 % 10 + '% completed');
                        }
                        if (completed.indexOf(false) === -1 && completed.length === users * rooms) {
                            done();
                        }
                    });

                    client.send(message);
                });
            });
        });
    }

    const tests = {
        small: [
            {
                rooms: 1,
                users: 1,
                messages: 10
            },
            {
                rooms: 10,
                users: 1,
                messages: 10
            },
            {
                rooms: 1,
                users: 8,
                messages: 10
            },
            {
                rooms: 10,
                users: 8,
                messages: 10
            }
        ],
        medium: [
            {
                rooms: 1,
                users: 1,
                messages: 100
            },
            {
                rooms: 100,
                users: 1,
                messages: 100
            },
            {
                rooms: 1,
                users: 8,
                messages: 100
            },
            {
                rooms: 100,
                users: 8,
                messages: 100
            }
        ],
        /*large: [
            {
                rooms: 1,
                users: 1,
                messages: 1000
            },
            {
                rooms: 1000,
                users: 1,
                messages: 1000
            },
            {
                rooms: 1,
                users: 8,
                messages: 1000
            },
            {
                rooms: 1000,
                users: 8,
                messages: 1000
            }
        ]*/
    }

    const keys = Object.keys(tests);

    describe('regular', function() {
        report = false;
        keys.forEach(function(key) {
            describe(key, function() {
                tests[key].forEach(function(test) {
                    rooms = test.rooms;
                    users = test.users;
                    messages = test.messages;
                    total = rooms * users * messages * 2; // * 2 because messages are sent both ways
                    it('should handle ' + rooms + ' rooms with ' + users + ' users sending ' 
                        + messages + ' messages each (' + total + ' messages)', function(done) {
    
                            rooms = test.rooms;
                            users = test.users;
                            messages = test.messages;
                            total = rooms * users * messages;
                            if (total >= 1000000) {
                                console.log('You might want to get a cup of coffee...');
                                report = true;
                            }
                            stress(rooms, users, messages, done, createRooms);
                    });
                });
            });
        });
    });
});

