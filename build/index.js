"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_socket_server_class_1 = require("./classes/web-socket-server.class");
require("./prototype");
try {
    const WSS = new web_socket_server_class_1.WebSocketServer();
}
catch (error) {
    console.error(error);
}
//# sourceMappingURL=index.js.map