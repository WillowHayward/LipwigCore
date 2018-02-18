var assert = require('assert');
const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;

describe('Stress', function() {
    this.timeout(0);
    let lw;
    let time;
    function estimatedTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
      
        return hrs + ' hours, ' + mins + ' minutes, and ' + secs + ' seconds.';
    }
    beforeEach(function(done) {
        console.log('Test starting at: ' + new Date());
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
        if (options === undefined) {
            options = {};
        }

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

    it('should allow for hundreds of messages to be passed between host and client', function(done) {
        const start = new Date().getTime();
        const host = create();
        const total = 1000;
        host.on('created', function(code) {
            host.id = code;
            const client = join(code);
            const message = {
                event: 'ping',
                data: [0],
                sender: '',
                recipient: []
            };
            client.on('joined', function(id) {
                message.sender = id;
                client.send(message);
            });

            client.on('pong', function(count) {
                if ((count / total * 100) % 10 === 0) {
                    const percentage = count / total * 100;
                    console.log(percentage + "% completed");
                }
                if (count >= 1000) {
                    time = new Date().getTime() - start;
                    done();
                } else {
                    message.data = [count];
                    client.send(message);
                }
            })
        });

        host.on('ping', function(count, message) {
            count++;
            const pong = {
                event: 'pong',
                data: [count],
                sender: host.id,
                recipient: [message.sender]
            };
            host.send(pong);
        });
    });

    it('should allow for hundreds of messages to be passed between host and client across hundreds of rooms', function(done) {
        const start = new Date().getTime();
        const estimated = time * 1000;
        const estimatedString = estimatedTime(estimated);
        console.log('Buckle up, this is estimated to take ' + estimatedString);
        completedCount = 0;
        completed = [];
        codes = [];
        created = 0;
        const total = 1000 * 1000
        let totalComplete = 0;
        let joined = 0;
        function createServer(i) {
            completed[i] = false;
            host = create();

            host.on('created', function(code) {
                codes[created] = code;
                created++;
                if (created < 1000) {
                    createServer(i + 1);
                } else {
                    console.log('All rooms created');
                    createClient(0);
                }
            });

            host.on('ping', function(count, id, message) {
                count++;
                const pong = {
                    event: 'pong',
                    data: [count, id],
                    sender: message.sender.slice(0, 4),
                    recipient: [message.sender]
                };
                this.send(pong);
            });
        }

        function createClient(i) {
            client = join(codes[i]);
            client.message = {
                event: 'ping',
                data: [0, i],
                sender: '',
                recipient: []
            };
            client.on('joined', function(id) {
                joined++;
                this.message.sender = id;
                this.send(this.message);
                if (joined < 1000) {
                    createClient(joined);
                } else {
                    console.log('All clients joined');
                }
            });

            client.on('pong', function(count, index) {
                totalComplete++;
                if ((totalComplete / total * 100) % 10 === 0) {
                    const percentage = totalComplete / total * 100;
                    console.log(percentage + "% completed");
                }
                if (count >= 1000) {
                    completed[index] = true;
                    if (completed.indexOf(false) === -1 && completed.length === 1000) {
                        time = new Date().getTime() - start;
                        done();
                    }
                } else {
                    this.message.data = [count, index];
                    this.send(this.message);
                }
            })
        };

        createServer(0);
    });

    it('should allow for hundreds of messages to be passed between host and client across hundreds of full rooms', function(done) {
        const estimated = time * 8;
        const estimatedString = estimatedTime(estimated);
        console.log('This one is estimated to take ' + estimatedString);
        completed = [];
        codes = [];
        created = 0;
        joined = 0;
        const total = 1000 * 1000 * 8;
        let totalComplete = 0;
        function createServer(i) {
            host = create();
            host.on('created', function(code) {
                codes[created] = code;
                created++;
                if (created < 1000) {
                    createServer(created);
                } else {
                    console.log('All rooms created');
                    createClient(0);
                }
            });

            host.on('ping', function(count, id, message) {
                count++;
                const pong = {
                    event: 'pong',
                    data: [count, id],
                    sender: message.sender.slice(0, 4),
                    recipient: [message.sender]
                };
                this.send(pong);
            });
        }

        function createClient(i) {
            completed[i] = [];
            client = join(codes[i % 1000]);
            client.message = {
                event: 'ping',
                data: [0, i],
                sender: '',
                recipient: []
            };
            client.on('joined', function(id) {
                joined++;
                this.message.sender = id;
                this.send(this.message);
                if (joined < 8000) {
                    createClient(joined);
                } else {
                    console.log('All clients joined');
                }
            });

            client.on('pong', function(count, index) {
                totalComplete++;
                if ((totalComplete / total * 100) % 10 === 0) {
                    const percentage = totalComplete / total * 100;
                    console.log(percentage + "% completed");
                }

                if (count >= 1000) {
                    completed[index] = true;
                    if (completed.indexOf(false) === -1 && completed.length === 8000) {
                        done();
                    }
                } else {
                    this.message.data = [count, index];
                    this.send(this.message);
                }
            })
        };

        createServer(0);
    });
});


