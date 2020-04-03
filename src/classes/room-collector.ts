import * as socket from 'socket.io'
import { Player } from './player.class'
import { Room } from "./room.class";
import { WebSocketServer } from './web-socket-server.class';

export class RoomCollector {
    static EVT_REFRESH_ROOM_LIST = 'refresh_roomlist'

    private _server: WebSocketServer

    private _rooms: Room[] = []
    private _counter: number = 0
    readonly lobby: Room

    constructor(server: WebSocketServer) {
        console.log('RoomCollector.constructor')
        this._server = server
        this.lobby = this.addRoom('Lobby')
    }

    public get server(): WebSocketServer {
        return this._server
    }

    public get rooms(): Room[] {
        return this._rooms
    }

    public get roomsLite(): object[] {
        const res: object[] = []
        for (const room of this._rooms) {
            let thisRoom = {
                roomName: room.name,
                roomId: room.id,
                roomPlayer: room.playersCount,
                roomIsLobby: room.isLobby
            }
            res.push(thisRoom)
        }
        return res
    }

    public get roomsNames(): String[] {
        const res: String[] = []
        this._rooms.forEach(element => {
            res.push(element.name)
        });
        return res
    }

    public getRoom(id: number | string): Room | undefined {
        let thisRoom = undefined
        if (typeof id == 'number') {
            thisRoom = this._rooms.getItemsWithProperty<Room>('id', id)
        } else {
            thisRoom = this._rooms.getItemsWithProperty<Room>('name', id)
        }
        return thisRoom
    }

    public get playersCount(): Number {
        let result: number = 0
        this._rooms.forEach(room => {
            result = result + room.playersCount
        });
        return result
    }
    public playerCount(id: number | string): Number {
        const room = this.getRoom(id)
        if (room == undefined) return 0
        return room.playersCount
    }

    public addRoom(roomName: String, gm?: Player | string, question?: string, players?: Player[]): Room {
        console.log('RoomCollector.addRoom [', roomName, ']')

        let thisGm: Player | undefined = undefined
        if (typeof gm == 'string') {
            thisGm = this.findPlayer(gm, this.lobby.id)
        } else {
            thisGm = gm
        }
        if (thisGm != undefined) {
            thisGm.role = Player.ROLE_GM
        }

        const room = new Room(this, roomName, thisGm, players)
        if (question != undefined) room.question = question

        this._rooms.push(room)
        this.roomListRefresh()
        return room
    }

    public removeRoom(room: number | string | Room) {
        let propName, propValue
        if (room instanceof Room) {
            propName = 'id'
            propValue = room.id
        } else {
            propValue = room
            if (typeof room == 'string') {
                if (room.sanitize().trim().length == 0) throw ('Name give is blank')
                propName = 'name'
            } else {
                if (room <= 0) throw ('Given id is invalid')
                propName = 'id'
            }
        }

        let idx: number = this._rooms.indexOfObjectWithProperty(propName, propValue)

        if (idx < 0) {
            console.warn('RoomCollecor.removeRoom - Room not found', room)
            return
        }

        this._rooms[idx].roomEmit(Room.EVT_ROOM_CLOSING)

        // const tmp = [...this._rooms[idx].players.list]
        this._rooms[idx].players.collectGarbage()
        for (const p of this._rooms[idx].players.listIterable) {
            this.movePlayer(p, this.lobby.id)
        }
        this._rooms[idx].players.resetList()
        this._rooms[idx].GM.role = Player.ROLE_PLAYER
        this._rooms[idx].GM.playerEmit(Player.EVT_PLAYER_LEAVE_ROOM, {})
        this.lobby.newPlayer = this._rooms[idx].GM
        delete this._rooms[idx]
        this._rooms.splice(idx, 1)
        this.roomListRefresh()
    }

    public movePlayer(playerId: string | Player, roomDest: number) {
        try {
            let player;
            if (playerId instanceof Player) {
                player = playerId
            } else {
                player = this.findPlayer(playerId)
            }
            if (!player) {
                console.error('Player not found', arguments)
                return;
            }
            if (!player.isValid()) return
            if (player.currentRoom != undefined && player.currentRoom.id == roomDest) return

            let nextRoom = this.getRoom(roomDest)
            if (nextRoom == undefined) nextRoom = this.lobby
            console.log('Moving [', player.userName, '] from [', player.currentRoom?.name, '] to [', nextRoom!.name, ']')

            player!.currentRoom?.players.removePlayer(player)
            nextRoom!.newPlayer = player!
        } catch (error) {
            console.error(error)
        }
    }

    public roomListRefresh(): void {
        this._server.publicEmit(RoomCollector.EVT_REFRESH_ROOM_LIST, { rooms: this.roomsLite })
    }

    public calcNewId(): number {
        this._counter++
        return this._counter
    }

    public isValidUsername(userName: String): { error: boolean, message: string } {
        const result = { error: false, message: '' }
        try {
            userName = userName.sanitize()
            if (userName.length == 0) throw ('Il nome risulta vuoto')
            if (userName.length > 16) throw ('Il nome è troppo lungo')
            let duplicate: boolean = false
            for (const room of this._rooms) {
                if (room.playersName.indexOf(userName) > -1) {
                    duplicate = true
                    break;
                }
            }
            if (duplicate) throw ('Il nome risulta già utilizzato')
        } catch (error) {
            result.error = true
            result.message = error
        }
        return result
    }

    private findPlayer(id: string, roomId?: number): Player | undefined {
        if (roomId) return this.getRoom(roomId)?.players.getPlayerById(id)
        return this._server.allPlayers.getPlayerById(id)
    }

}