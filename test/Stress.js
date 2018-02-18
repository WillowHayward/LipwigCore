var assert = require('assert');
const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;

describe('Stress', function() {
    this.timeout(0);
    let lw;
    let time;

    before(function(done) {
        console.log('Test starting at: ' + new Date());
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        });
    });
    
    after(function(done) {
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

    report = false;

    function createRooms(remaining, done, codes) {
        codes = codes || [];
        host = create();
        host.on('created', function(code) {
            codes.push(code);

            this.message = {
                event: 'pong',
                data: [],
                sender: code,
                recipient: []
            }

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

        host.on('ping', function(count, message) {
            this.message.data[0] = count;
            this.message.recipient[0] = message.sender;
            this.send(this.message);
        });
    }

    function joinRooms(remaining, codes, done, users) {
        users = users || [];
        code = codes[remaining % codes.length];
        client = join(code);
        client.on('joined', function(id) {
            this.id = id;
            users.push(this);
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

        client.on('pong', function(count) {
            count++;
            if (count === this.total) {
                this.emit('finished');
            } else {
                this.message.data[0] = count;
                this.send(this.message);
            }
        });
    }

    function stress(rooms, users, messages, done) {
        expected = rooms * users * messages;
        codes = [];
        completed = [];
        createRooms(rooms, function(codes) {
            joinRooms(users * rooms, codes, function(clients) {
                clients.forEach(function(client, index) {
                    completed[index] = false;
                    client.message = {
                        event: 'ping',
                        data: [0],
                        sender: client.id,
                        recipient: []
                    }

                    client.total = messages;

                    client.on('finished', function() {
                        completed[index] = true;
                        if (completed.indexOf(false) === -1 && completed.length === users * rooms) {
                            done();
                        }
                    });

                    client.send(client.message);
                });
            });
        });

    }

    tests = {
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
        large: [
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
        ]
    }
    const keys = Object.keys(tests);
    keys.forEach(function(key) {
        describe(key, function() {
            tests[key].forEach(function(test) {
                rooms = test.rooms;
                users = test.users;
                messages = test.messages;
                total = rooms * users * messages;
                it('should handle ' + rooms + ' rooms with ' + users + ' users sending ' 
                    + messages + ' messages each (' + total + ' messages)', function(done) {

                        rooms = test.rooms;
                        users = test.users;
                        messages = test.messages;
                        total = rooms * users * messages;
                        if (total > 1000000) {
                            console.log('You might want to get a cup of coffee...');
                            report = true;
                        }
                        stress(rooms, users, messages, done);
                });
            });
        });
    });
});


