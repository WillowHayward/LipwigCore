const ErrorCode = require('../lib/Types.js').ErrorCode;
const Lipwig = require('../lib/Lipwig.js');
const Stub = require('../lib/Stub.js').Stub;
let lw;

describe('Errors', function() {
    before(function(done) {
        lw = new Lipwig();
        lw.on('started', function() {
            done();
        })
    });

    after(function() {
        lw.exit();
    });
    
    describe(ErrorCode.MALFORMED + ' - Malformed', function() {

    });
    describe(ErrorCode.ROOMNOTFOUND + ' - Room not Found', function() {

    });
    describe(ErrorCode.ROOMFULL + ' - Room Full', function() {

    });
    describe(ErrorCode.USERNOTFOUND + ' - User Not Found', function() {

    });
    describe(ErrorCode.INSUFFICIENTPERMISSIONS + ' - Insufficient Permission', function() {

    });
});