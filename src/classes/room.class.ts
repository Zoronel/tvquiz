import { Player } from "./player.class";
import { RoomCollector } from "./room-collector";
import { SocketEvent } from "./event.class";
import { PlayerCollector } from "./player-collector";

export class Room {
    static EVT_REFRESH_USERLIST: string = 'refresh_userlist'
    static EVT_NEW_QUESTION: string = 'new_question'
    static EVT_ROOM_CLOSING: string = 'closing'

    private _id: number = -1
    private _isLobby: boolean = false
    private _creationDate: Date
    private _name: String
    private _question: String = ''
    private _GM?: Player
    private _players: PlayerCollector
    private _roomCollector: RoomCollector

    constructor(roomCollector: RoomCollector, name?: String, gm?: Player, players?: Player[]) {
        this._creationDate = new Date()
        this._roomCollector = roomCollector
        this._id = roomCollector.calcNewId();

        if (this._id == 1) this._isLobby = true
        if (name != undefined) {
            this._name = name.sanitize().trim().substring(0, 20)
        } else {
            this._name = 'Stanza (1)'
        }
        this.uniqueName()

        this._players = new PlayerCollector(this)

        if (gm != undefined) this.GM = gm;
        if (players != undefined && players.length > 0) this.newPlayer = players

        console.log('Room.constructor [', name, ']');
    }

    public set question(v: String) {
        v = v.trim();
        if (v.length == 0) throw ('La domanda non può essere vuota');
        // v = v.htmlEncode()
        // v = v.replace(/(\r\n|\n|\r)/g, '<br>')
        // v.replace(/\s+/, ' ');
        if (v.length > 200) throw ('La domanda deve rimanere entro i 200 caratteri');
        this._question = v;
        this.roomEmit(Room.EVT_NEW_QUESTION, v, true)
    }

    public get question(): String {
        return this._question;
    }

    public get creationDate(): String {
        return this._creationDate.toDateTimeIt()
    }

    public set newPlayer(newUser: Player | Player[]) {
        console.log('Room[', this._name, '].addPlayer')
        let newUsers: Player[]
        if (typeof (newUser) == 'object' && newUser instanceof Array) {
            newUsers = newUser
        } else {
            newUsers = []
            newUsers.push(newUser)
        }
        for (let user of newUsers) {
            console.log('|__ adding ', user.userName)
            if (!user.connected) {
                console.log('   |__ user connection lost')
                continue
            }
            let errMsg = ''
            if (!user.isValid()) {
                errMsg = 'User is not Valid'
            }
            if (!this._isLobby && user.role != Player.ROLE_PLAYER) {
                errMsg = 'User is not Palyer'
            }
            if (errMsg.length > 0) {
                user.playerEmit('error', errMsg)
                continue;
            }
            this._players.newElement = user;
            user.currentRoom = this
            user.playerEmit('room_welcome', { currentRoomId: this._id })
        }
        this.refreshUserList()
    }

    public get players(): PlayerCollector {
        return this._players
    }

    public get playersCount(): number {
        return this._players.list.length
    }

    public get playersName(): String[] {
        let result: String[] = []
        for (const o of this._players.list) {
            result.push(o.userName)
        }
        return result
    }

    public get playersLite(): { id: string, userName: String, currentRoomId: number }[] {
        const players: { id: string, userName: String, currentRoomId: number }[] = []
        for (const p of this._players.list) {
            let thisPlayer = {
                id: p.id,
                userName: p.userName,
                currentRoomId: p.currentRoom.id
            }
            players.push(thisPlayer)
        }
        return players
    }

    public set GM(gm: Player) {
        if (!this._GM == undefined) return
        if (gm.isValid() && gm.role == Player.ROLE_GM) {
            gm.currentRoom.players.removePlayer(gm)
            this._GM = gm
            gm.currentRoom = this
            // gm.statusUpdate()
        }
    }
    public get GM(): Player {
        return this._GM!
    }
    public get id(): number {
        return this._id;
    }
    public get name(): String {
        return this._name
    }

    public get isLobby(): boolean {
        return this._isLobby
    }

    private uniqueName(): void {
        while (this._roomCollector.roomsNames.indexOf(this._name) != -1) {
            let name: String = this._name
            let namePart = name.match(/^([\s\d\w]+) ?(\({1}(\d)+\){1})?/)
            if (namePart) {
                name = namePart[1].trim()
                let upcount: number = parseInt(namePart[3])
                if (isNaN(upcount)) upcount = 0
                upcount++
                this._name = name + ' (' + upcount + ')'
            } else {
                this._name = 'Stanza (1)'
            }
        }
    }

    public close(): void {
        console.log('Room[', this._name, '].closing')
        this._roomCollector.removeRoom(this)
    }

    public resetPlayers(): void {
        this._players.resetList()
        this.refreshUserList()
    }

    public refreshUserList(): void {
        // console.log(this._players)
        this.roomEmit(Room.EVT_REFRESH_USERLIST, { playersCount: this.playersCount, players: this.playersLite }, true)
        this._roomCollector.roomListRefresh()
    }

    public roomEmit(eventName: string, data?: any, includeGM?: Boolean) {
        const thisEvent = new SocketEvent(eventName, 'Room', data);
        for (const p of this._players.list) {
            p.skt.emit(SocketEvent.BASE_NAME, thisEvent.event)
        }
        if (includeGM && this.GM != undefined) this.GM.skt.emit(SocketEvent.BASE_NAME, thisEvent.event)
    }
}
