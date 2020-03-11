import * as socket from 'socket.io'
import { Client } from './client.class'
import { Room } from "./room.class";

export class RoomCollector {
    private _rooms: Room[] = []
    private _counter: number = 0
    readonly lobby: Room

    constructor() {
        this.lobby = this.addRoom('Lobby')
    }

    public addRoom(roomName: String, gm?: Client, players?: Client[]): Room {
        console.log('RoomCollector.addRoom', arguments)
        this._counter++
        const roomId = this._counter
        const room = new Room(roomId, roomName, gm, players);
        this._rooms.push(room)
        return room
    }

    public removeRoom(roomId: number) {
        if (roomId <= 0) throw ('Given id is invalid')
        const room: Room = this._rooms.getItemsWithProperty<Room>('id', roomId)
        room.resetPlayers()
        room.GM.skt.emit('byebye')
    }
}