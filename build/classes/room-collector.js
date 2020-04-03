"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_class_1 = require("./player.class");
const room_class_1 = require("./room.class");
class RoomCollector {
    constructor(server) {
        this._rooms = [];
        this._counter = 0;
        console.log('RoomCollector.constructor');
        this._server = server;
        this.lobby = this.addRoom('Lobby');
    }
    get server() {
        return this._server;
    }
    get rooms() {
        return this._rooms;
    }
    get roomsLite() {
        const res = [];
        for (const room of this._rooms) {
            let thisRoom = {
                roomName: room.name,
                roomId: room.id,
                roomPlayer: room.playersCount,
                roomIsLobby: room.isLobby
            };
            res.push(thisRoom);
        }
        return res;
    }
    get roomsNames() {
        const res = [];
        this._rooms.forEach(element => {
            res.push(element.name);
        });
        return res;
    }
    getRoom(id) {
        let thisRoom = undefined;
        if (typeof id == 'number') {
            thisRoom = this._rooms.getItemsWithProperty('id', id);
        }
        else {
            thisRoom = this._rooms.getItemsWithProperty('name', id);
        }
        return thisRoom;
    }
    get playersCount() {
        let result = 0;
        this._rooms.forEach(room => {
            result = result + room.playersCount;
        });
        return result;
    }
    playerCount(id) {
        const room = this.getRoom(id);
        if (room == undefined)
            return 0;
        return room.playersCount;
    }
    addRoom(roomName, gm, question, players) {
        console.log('RoomCollector.addRoom [', roomName, ']');
        let thisGm = undefined;
        if (typeof gm == 'string') {
            thisGm = this.findPlayer(gm, this.lobby.id);
        }
        else {
            thisGm = gm;
        }
        if (thisGm != undefined) {
            thisGm.role = player_class_1.Player.ROLE_GM;
        }
        const room = new room_class_1.Room(this, roomName, thisGm, players);
        if (question != undefined)
            room.question = question;
        this._rooms.push(room);
        this.roomListRefresh();
        return room;
    }
    removeRoom(room) {
        let propName, propValue;
        if (room instanceof room_class_1.Room) {
            propName = 'id';
            propValue = room.id;
        }
        else {
            propValue = room;
            if (typeof room == 'string') {
                if (room.sanitize().trim().length == 0)
                    throw ('Name give is blank');
                propName = 'name';
            }
            else {
                if (room <= 0)
                    throw ('Given id is invalid');
                propName = 'id';
            }
        }
        let idx = this._rooms.indexOfObjectWithProperty(propName, propValue);
        if (idx < 0) {
            console.warn('RoomCollecor.removeRoom - Room not found', room);
            return;
        }
        this._rooms[idx].roomEmit(room_class_1.Room.EVT_ROOM_CLOSING);
        // const tmp = [...this._rooms[idx].players.list]
        this._rooms[idx].players.collectGarbage();
        for (const p of this._rooms[idx].players.listIterable) {
            this.movePlayer(p, this.lobby.id);
        }
        this._rooms[idx].players.resetList();
        this._rooms[idx].GM.role = player_class_1.Player.ROLE_PLAYER;
        this._rooms[idx].GM.playerEmit(player_class_1.Player.EVT_PLAYER_LEAVE_ROOM, {});
        this.lobby.newPlayer = this._rooms[idx].GM;
        delete this._rooms[idx];
        this._rooms.splice(idx, 1);
        this.roomListRefresh();
    }
    movePlayer(playerId, roomDest) {
        var _a, _b;
        try {
            let player;
            if (playerId instanceof player_class_1.Player) {
                player = playerId;
            }
            else {
                player = this.findPlayer(playerId);
            }
            if (!player) {
                console.error('Player not found', arguments);
                return;
            }
            if (!player.isValid())
                return;
            if (player.currentRoom != undefined && player.currentRoom.id == roomDest)
                return;
            let nextRoom = this.getRoom(roomDest);
            if (nextRoom == undefined)
                nextRoom = this.lobby;
            console.log('Moving [', player.userName, '] from [', (_a = player.currentRoom) === null || _a === void 0 ? void 0 : _a.name, '] to [', nextRoom.name, ']');
            (_b = player.currentRoom) === null || _b === void 0 ? void 0 : _b.players.removePlayer(player);
            nextRoom.newPlayer = player;
        }
        catch (error) {
            console.error(error);
        }
    }
    roomListRefresh() {
        this._server.publicEmit(RoomCollector.EVT_REFRESH_ROOM_LIST, { rooms: this.roomsLite });
    }
    calcNewId() {
        this._counter++;
        return this._counter;
    }
    isValidUsername(userName) {
        const result = { error: false, message: '' };
        try {
            userName = userName.sanitize();
            if (userName.length == 0)
                throw ('Il nome risulta vuoto');
            if (userName.length > 16)
                throw ('Il nome è troppo lungo');
            let duplicate = false;
            for (const room of this._rooms) {
                if (room.playersName.indexOf(userName) > -1) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate)
                throw ('Il nome risulta già utilizzato');
        }
        catch (error) {
            result.error = true;
            result.message = error;
        }
        return result;
    }
    findPlayer(id, roomId) {
        var _a;
        if (roomId)
            return (_a = this.getRoom(roomId)) === null || _a === void 0 ? void 0 : _a.players.getPlayerById(id);
        return this._server.allPlayers.getPlayerById(id);
    }
}
exports.RoomCollector = RoomCollector;
RoomCollector.EVT_REFRESH_ROOM_LIST = 'refresh_roomlist';
//# sourceMappingURL=room-collector.js.map