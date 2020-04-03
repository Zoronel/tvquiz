"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_class_1 = require("./player.class");
const event_class_1 = require("./event.class");
const player_collector_1 = require("./player-collector");
class Room {
    constructor(roomCollector, name, gm, players) {
        this._id = -1;
        this._isLobby = false;
        this._question = '';
        this._creationDate = new Date();
        this._roomCollector = roomCollector;
        this._id = roomCollector.calcNewId();
        if (this._id == 1)
            this._isLobby = true;
        if (name != undefined) {
            this._name = name.sanitize().trim().substring(0, 20);
        }
        else {
            this._name = 'Stanza (1)';
        }
        this.uniqueName();
        this._players = new player_collector_1.PlayerCollector(this);
        if (gm != undefined)
            this.GM = gm;
        if (players != undefined && players.length > 0)
            this.newPlayer = players;
        console.log('Room.constructor [', name, ']');
    }
    set question(v) {
        v = v.trim();
        if (v.length == 0)
            throw ('La domanda non può essere vuota');
        // v = v.htmlEncode()
        // v = v.replace(/(\r\n|\n|\r)/g, '<br>')
        // v.replace(/\s+/, ' ');
        if (v.length > 200)
            throw ('La domanda deve rimanere entro i 200 caratteri');
        this._question = v;
        this.roomEmit(Room.EVT_NEW_QUESTION, v, false);
    }
    get question() {
        return this._question;
    }
    get creationDate() {
        return this._creationDate.toDateTimeIt();
    }
    set newPlayer(newUser) {
        console.log('Room[', this._name, '].addPlayer');
        let newUsers;
        if (typeof (newUser) == 'object' && newUser instanceof Array) {
            newUsers = newUser;
        }
        else {
            newUsers = [];
            newUsers.push(newUser);
        }
        for (let user of newUsers) {
            console.log('|__ adding ', user.userName);
            if (!user.connected) {
                console.log('   |__ user connection lost');
                continue;
            }
            let errMsg = '';
            if (!user.isValid()) {
                errMsg = 'User is not Valid';
            }
            if (!this._isLobby && user.role != player_class_1.Player.ROLE_PLAYER) {
                errMsg = 'User is not Palyer';
            }
            if (errMsg.length > 0) {
                user.playerEmit('error', errMsg);
                continue;
            }
            this._players.newElement = user;
            user.currentRoom = this;
            user.playerEmit('room_welcome', { currentRoomId: this._id });
        }
        this.refreshUserList();
    }
    get players() {
        return this._players;
    }
    get playersCount() {
        return this._players.list.length;
    }
    get playersName() {
        let result = [];
        for (const o of this._players.list) {
            result.push(o.userName);
        }
        return result;
    }
    get playersLite() {
        const players = [];
        for (const p of this._players.list) {
            let thisPlayer = {
                id: p.id,
                userName: p.userName,
                currentRoomId: p.currentRoom.id
            };
            players.push(thisPlayer);
        }
        return players;
    }
    set GM(gm) {
        if (!this._GM == undefined)
            return;
        if (gm.isValid() && gm.role == player_class_1.Player.ROLE_GM) {
            gm.currentRoom.players.removePlayer(gm);
            this._GM = gm;
            gm.currentRoom = this;
            // gm.statusUpdate()
        }
    }
    get GM() {
        return this._GM;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get isLobby() {
        return this._isLobby;
    }
    uniqueName() {
        while (this._roomCollector.roomsNames.indexOf(this._name) != -1) {
            let name = this._name;
            let namePart = name.match(/^([\s\d\w]+) ?(\({1}(\d)+\){1})?/);
            if (namePart) {
                name = namePart[1].trim();
                let upcount = parseInt(namePart[3]);
                if (isNaN(upcount))
                    upcount = 0;
                upcount++;
                this._name = name + ' (' + upcount + ')';
            }
            else {
                this._name = 'Stanza (1)';
            }
        }
    }
    close() {
        console.log('Room[', this._name, '].closing');
        this._roomCollector.removeRoom(this);
    }
    resetPlayers() {
        this._players.resetList();
        this.refreshUserList();
    }
    refreshUserList() {
        // console.log(this._players)
        this.roomEmit(Room.EVT_REFRESH_USERLIST, { playersCount: this.playersCount, players: this.playersLite }, true);
        this._roomCollector.roomListRefresh();
    }
    roomEmit(eventName, data, includeGM) {
        const thisEvent = new event_class_1.SocketEvent(eventName, 'Room', data);
        for (const p of this._players.list) {
            p.skt.emit(event_class_1.SocketEvent.BASE_NAME, thisEvent.event);
        }
        if (includeGM && this.GM != undefined)
            this.GM.skt.emit(event_class_1.SocketEvent.BASE_NAME, thisEvent.event);
    }
}
exports.Room = Room;
Room.EVT_REFRESH_USERLIST = 'refresh_userlist';
Room.EVT_NEW_QUESTION = 'new_question';
Room.EVT_ROOM_CLOSING = 'closing';
//# sourceMappingURL=room.class.js.map