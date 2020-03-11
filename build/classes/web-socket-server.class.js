"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const socket = require("socket.io");
const httpFactory = require("http");
const client_class_1 = require("./client.class");
const room_collector_1 = require("./room-collector");
class WebSocketServer {
    constructor() {
        this.app = express();
        this.http = httpFactory.createServer(this.app);
        this.io = socket();
        this.io.listen(this.http);
        this.http.listen(3000, () => {
            console.log('Server is Listening');
        });
        this.building = new room_collector_1.RoomCollector();
        this.io.on('connection', (client) => {
            console.log('CONNESSO', client);
            const tc = new client_class_1.Client(client);
            tc.skt.emit('whoyouare');
            this.building.lobby.player = tc;
        });
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=web-socket-server.class.js.map