"use strict";
exports.__esModule = true;
exports.Dashboard = void 0;
var express = require("express");
var Dashboard = (function () {
    function Dashboard(http) {
        this.http = http;
        var app = express();
        this.http.on('request', app);
        app.get('/', function (req, res) {
            res.send('Hello World');
        });
    }
    return Dashboard;
}());
exports.Dashboard = Dashboard;
