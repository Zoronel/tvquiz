"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_class_1 = require("./client.class");
const util_1 = require("util");
class Room {
    constructor(assignedId, name, gm, players) {
        this._id = -1;
        this._question = '';
        this._players = [];
        this._creationDate = new Date();
        this._id = assignedId;
        if (gm != undefined)
            this.GM = gm;
        if (players != undefined && players.length > 0)
            this.player = players;
        if (name != undefined) {
            this._name = name.sanitize();
        }
        else {
            this._name = 'N/D';
        }
        console.log('Room.constructor', this);
    }
    set question(v) {
        v = v.trim();
        if (v.length == 0)
            throw ('La domanda non può essere vuota');
        v.replace(/\s+/, ' ');
        if (v.length > 200)
            throw ('La domanda deve rimanere entro i 200 caratteri');
        this._question = v;
    }
    get question() {
        return this._question;
    }
    get creationDate() {
        return this._creationDate.toDateTimeIt();
    }
    set player(player) {
        let players;
        if (util_1.isArray(player)) {
            players = player;
        }
        else {
            players = [];
            players.push(player);
        }
        for (const user of players) {
            if (user.isValid() && user.role == client_class_1.Client.ROLE_PLAYER) {
                this._players.push(user);
                user.skt.emit('welcome-user', { currentRoomId: this._id, currentGM: this._GM, currentQuestion: this._question });
            }
        }
    }
    get players() {
        return this._players;
    }
    set GM(gm) {
        if (!this._GM == undefined)
            return;
        if (gm.isValid() && gm.role == client_class_1.Client.ROLE_GM) {
            this._GM = gm;
            gm.skt.emit('welcome-gm', { currentRoomId: this._id });
        }
    }
    get GM() {
        return this._GM;
    }
    get id() {
        return this._id;
    }
    resetPlayers() {
        for (let i in this._players) {
            let o = this._players[i];
            o.skt.emit('byebye');
        }
        this._players = [];
    }
    removePlayerByName(id) {
        for (let i in this._players) {
            let o = this._players[i];
            if (o.userName == id) {
                o.skt.emit('byebye');
                delete this._players[i];
            }
        }
    }
    removePlayerByIndex(id) {
        if (id > this._players.length)
            throw ('Player number ' + id + ' not found');
        delete this._players[id];
    }
    removePlayer(id) {
        if (util_1.isNumber(id))
            this.removePlayerByIndex(id);
        if (util_1.isString(id))
            this.removePlayerByName(id);
    }
}
exports.Room = Room;
//# sourceMappingURL=room.class.js.map