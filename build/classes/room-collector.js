"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_class_1 = require("./room.class");
class RoomCollector {
    constructor() {
        this._rooms = [];
        this._counter = 0;
        this.lobby = this.addRoom('Lobby');
    }
    addRoom(roomName, gm, players) {
        console.log('RoomCollector.addRoom', arguments);
        this._counter++;
        const roomId = this._counter;
        const room = new room_class_1.Room(roomId, roomName, gm, players);
        this._rooms.push(room);
        return room;
    }
    removeRoom(roomId) {
        if (roomId <= 0)
            throw ('Given id is invalid');
        const room = this._rooms.getItemsWithProperty('id', roomId);
        room.resetPlayers();
        room.GM.skt.emit('byebye');
    }
}
exports.RoomCollector = RoomCollector;
//# sourceMappingURL=room-collector.js.map