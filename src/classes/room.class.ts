import { Client } from "./client.class";
import { isNumber, isString, isArray } from "util";

export class Room {
    private _id: Number = -1
    private _creationDate: Date
    private _name: String
    private _question: String = ''
    private _GM?: Client
    private _players: Client[] = []

    constructor(assignedId: Number, name?: String, gm?: Client, players?: Client[]) {
        this._creationDate = new Date()
        this._id = assignedId;
        if (gm != undefined) this.GM = gm;
        if (players != undefined && players.length > 0) this.player = players
        if (name != undefined) {
            this._name = name.sanitize()
        } else {
            this._name = 'N/D'
        }
        console.log('Room.constructor', this);
    }

    public set question(v: String) {
        v = v.trim();
        if (v.length == 0) throw ('La domanda non può essere vuota');
        v.replace(/\s+/, ' ');
        if (v.length > 200) throw ('La domanda deve rimanere entro i 200 caratteri');
        this._question = v;
    }

    public get question(): String {
        return this._question;
    }

    public get creationDate(): String {
        return this._creationDate.toDateTimeIt()
    }
    public set player(player: Client | Client[]) {
        let players: Client[]
        if (isArray(player)) {
            players = player
        } else {
            players = []
            players.push(player)
        }
        for (const user of players) {
            if (user.isValid() && user.role == Client.ROLE_PLAYER) {
                this._players.push(user);
                user.skt.emit('welcome-user', { currentRoomId: this._id, currentGM: this._GM, currentQuestion: this._question })
            }
        }
    }
    public get players(): Client[] {
        return this._players
    }
    public set GM(gm: Client) {
        if (!this._GM == undefined) return
        if (gm.isValid() && gm.role == Client.ROLE_GM) {
            this._GM = gm
            gm.skt.emit('welcome-gm', { currentRoomId: this._id });
        }
    }
    public get GM(): Client {
        return this._GM!
    }
    public get id(): Number {
        return this._id;
    }
    public resetPlayers(): void {
        for (let i in this._players) {
            let o = this._players[i];
            o.skt.emit('byebye')
        }
        this._players = [];
    }

    private removePlayerByName(id: String) {
        for (let i in this._players) {
            let o = this._players[i];
            if (o.userName == id) {
                o.skt.emit('byebye')
                delete this._players[i]
            }
        }
    }
    private removePlayerByIndex(id: number) {
        if (id > this._players.length) throw ('Player number ' + id + ' not found')
        delete this._players[id];
    }
    public removePlayer(id: String) {
        if (isNumber(id)) this.removePlayerByIndex(id)
        if (isString(id)) this.removePlayerByName(id)
    }
}
