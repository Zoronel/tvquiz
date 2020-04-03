import * as socket from 'socket.io'
import { WebSocketServer } from './web-socket-server.class'
import { Room } from './room.class'
import { SocketEvent } from './event.class'

export class Player {
    static EVT_PLAYER_VALID = 'identity_accepted'
    static EVT_PLAYER_LEAVE_ROOM = 'leave_room'

    static ROLE_ND: Number = 0
    static ROLE_GM: Number = 1
    static ROLE_PLAYER: Number = 2

    private _server: WebSocketServer

    public skt: socket.Socket
    readonly id: string
    private validClient: Boolean = false
    private _userName: String = 'Guest'
    private _role: Number = Player.ROLE_ND
    private _currenRoom?: Room
    private _deathWard: NodeJS.Timeout

    constructor(client: socket.Socket, server: WebSocketServer) {
        // console.log(client);
        this.skt = client;
        this.id = client.id.sanitize().trim()
        this._server = server
        this.skt.on('whoiam', this.defineIdentity());
        this._deathWard = setInterval(() => {
            if (!this.skt.connected) {
                console.log('Player', this._userName, '[', this.id, ']Connection lost')
                if (this._currenRoom != undefined) {
                    if (this._role == Player.ROLE_PLAYER) {
                        this._currenRoom.players.removePlayerById(this.id)
                    } else {
                        this._currenRoom.close()
                    }
                }
                this._server.allPlayers.removePlayer(this, true)
                clearInterval(this._deathWard)
            }
        }, 2000);
    }

    private defineIdentity(): (data: { name: String, role: number }) => void {
        const that = this
        return function (data: { name: String, role: number }): void {

            console.log('Client.identity', data.name, data.role);
            try {
                let name: String = data.name

                const nameCheck = that.server.isValidUsername(name)
                if (nameCheck.error) throw (nameCheck.message)

                that._userName = name

                let role: Number = data.role
                if (role < 0 || role > 2) throw ('Il ruolo selezionato non è valido')
                if (role == 0) role = 2
                that._role = role

                that.validClient = true
                that.playerEmit(Player.EVT_PLAYER_VALID, { userName: that.userName, id: that.id })
                that._server.putInLobby(that)
            } catch (error) {
                console.log(error);
                that.skt.emit('error', error)
                that.validClient = false
            }
        }
    }

    public get server(): WebSocketServer {
        return this._server
    }

    public get connected(): Boolean {
        return this.skt.connected
    }

    public get userName(): String {
        return this._userName
    }
    public get role(): Number {
        return this._role
    }
    public set role(role: Number) {
        if (role < 1 || role > 2) role = 1
        this._role = role
        this.statusUpdate()
    }

    public set currentRoom(room: Room) {
        this._currenRoom = room
        this.statusUpdate()
    }

    public get currentRoom(): Room {
        return this._currenRoom!
    }

    public get info() {
        return {
            id: this.id,
            name: this._userName,
            role: this._role,
            currentRoom: this._currenRoom?.name,
            currentRoomId: this._currenRoom?.id,
        }
    }

    public isValid(): Boolean {
        return this.validClient
    }

    public playerEmit(evenName: String, eventData: any): void
    public playerEmit(socketEvent: SocketEvent): void
    public playerEmit() {
        const args = arguments;
        let eventData
        if (args.length = 0) {
            console.error('PublicEmit. No argument given')
        } else {
            if ((typeof args[0] != 'object' || (typeof args[0] == 'object' && !(args[0] instanceof SocketEvent))) && typeof args[0] != 'string') {
                throw ('First argument must be a event name or a SocketEvent Object')
            }
            if (typeof args[0] == 'object') {
                const SktEvt: SocketEvent = args[0]
                if (SktEvt.origin == 'Global') SktEvt.origin = 'Player'
                eventData = SktEvt.event
            } else {
                eventData = new SocketEvent(args[0], 'Player', args[1]).event
            }
        }
        if (args.length > 2) {
            console.warn('Too many arguments passed. Extra wil be ignored')
        }
        if (this.connected)
            this.skt.emit(SocketEvent.BASE_NAME, eventData)
    }

    public connectionEmit(socketEvent: SocketEvent): void {
        if (this.connected)
            this.skt.emit(SocketEvent.BASE_NAME, socketEvent.event)
    }

    public statusUpdate(): void {
        this.playerEmit('status_update', this.info)
    }
}