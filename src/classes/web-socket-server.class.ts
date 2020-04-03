import * as express from 'express'
// import * as cors from 'cors'
import * as socket from 'socket.io'
import * as httpFactory from 'http'
import { Player } from './player.class'
import { RoomCollector } from './room-collector'
import { Room } from './room.class'
import { SocketEvent } from './event.class'
import { PlayerCollector } from './player-collector'

export class WebSocketServer {
    private app: express.Application
    private cors: any = require('cors')
    private http: httpFactory.Server
    private io: socket.Server

    private building: RoomCollector
    private anagrafe: PlayerCollector

    constructor() {

        const corsOptions: any = {
            origin: '*',
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204
        }

        this.app = express()
        this.app.use(this.cors(corsOptions))
        this.http = httpFactory.createServer(this.app)
        this.io = socket()
        this.io.listen(this.http)
        this.http.listen(3000, () => {
            console.log('Server is Listening on port 3000')
        })

        this.building = new RoomCollector(this)
        this.anagrafe = new PlayerCollector()
        setInterval(() => {
            this.anagrafe.collectGarbage();
            for (const p of this.anagrafe.listIterable) {
                if (!p.connected) {
                    if (p.currentRoom != undefined) p.currentRoom.players.removePlayer(p)
                    if (this.anagrafe.removePlayer(p, true)) {
                        console.log('Orphan killed')
                    }
                } else if (p.isValid() && p.currentRoom == undefined) {
                    console.log('Orphan put in Lobby')
                    this.putInLobby(p)
                }
            }
        }, 30000)

        this.io.on('connection', (socket: socket.Socket) => {
            console.log('NUOVA CONNESSIONE')
            const player = new Player(socket, this);
            this.anagrafe.newElement = player
            player.skt.emit('whoyouare', { id: player.id });
            player.skt.on('client-event', (clientEvent: any) => {
                console.log('client-request', clientEvent.type, clientEvent.name)
                this.eventSort(player, clientEvent)
            })
        })
    }

    public get allPlayers(): PlayerCollector {
        return this.anagrafe
    }

    public isValidUsername(userName: String): { error: boolean, message: string } {
        return this.building.isValidUsername(userName);
    }

    public putInLobby(player: Player) {
        this.building.lobby.newPlayer = player
    }

    public publicEmit(eventName: string, data: any): void
    public publicEmit(event: SocketEvent): void
    public publicEmit() {
        const args = arguments;
        let eventData
        if (args.length = 0) {
            console.error('PublicEmit. No argument given')
        } else {
            if ((typeof args[0] != 'object' || (typeof args[0] == 'object' && !(args[0] instanceof SocketEvent))) && typeof args[0] != 'string') {
                throw ('First argument must be a event name or a SocketEvent Object')
            }
            if (typeof args[0] == 'object') {
                eventData = args[0].event
            } else {
                eventData = new SocketEvent(args[0], '', args[1]).event
            }
        }
        if (args.length > 2) {
            console.warn('Too many arguments passed. Extra wil be ignored')
        }
        this.io.sockets.emit(SocketEvent.BASE_NAME, eventData)
    }

    public roomEmit(room: string | number | Room, eventName: string, data: any) {
        let thisRoom: Room | undefined
        if (room instanceof Room) {
            thisRoom = room
        } else {
            thisRoom = this.building.getRoom(room)
        }
        if (thisRoom == undefined) {
            console.error('Server.roomEmit. room not found', room, this.building)
            throw ('Given room identifyer is invalid')
        }
        thisRoom.roomEmit(eventName, data)
    }

    private eventSort(player: Player, clientEvent: { type: string; name: string; data: any }) {
        switch (clientEvent.type) {
            case 'RoomCollector':
                switch (clientEvent.name) {
                    case 'room_list':
                        let firstRoomList = new SocketEvent(RoomCollector.EVT_REFRESH_ROOM_LIST, 'Global', { rooms: this.building.roomsLite })
                        player.connectionEmit(firstRoomList)
                        break;
                    case 'move_player':
                        const movePlayerData = clientEvent.data
                        this.building.movePlayer(movePlayerData.playerId, movePlayerData.destRoomId)
                        break
                    case 'close_room':
                        const roomId: number = clientEvent.data
                        this.building.removeRoom(roomId)
                        break
                    default:
                        console.error('evento non gestito', clientEvent.name)
                        break;
                }
                break;
            case 'Room':
                switch (clientEvent.name) {
                    case 'get_room_info':
                        const id: number = clientEvent.data.id
                        const thisRoom: Room | undefined = this.building.getRoom(id)
                        if (thisRoom != undefined) {
                            let roomInfo = {
                                roomName: thisRoom.name,
                                roomId: thisRoom.id,
                                roomQuestion: thisRoom.question,
                                roomGm: thisRoom.GM?.userName,
                                roomGmId: thisRoom.GM?.id,
                                roomIsLobby: thisRoom.isLobby
                            }
                            const thisEvent = new SocketEvent('room_info', 'Room', roomInfo)
                            player.connectionEmit(thisEvent)
                        }
                        break;
                    case 'add_room':
                        const newRoomData = clientEvent.data
                        const newRoom: Room = this.building.addRoom(newRoomData.roomName, player, newRoomData.roomQuestion)
                        player.playerEmit('room_ready', newRoom.id)
                        break;
                    case 'room_booking':
                        const timeBooking: number = +new Date()
                        const roomBookingData = clientEvent.data
                        const roomToBookIn = this.building.getRoom(roomBookingData.roomId)
                        const bookingEvent: SocketEvent = new SocketEvent('player_reservation', 'Room', { playerId: player.id, timeBooking: timeBooking })
                        roomToBookIn?.GM.connectionEmit(bookingEvent)
                        // roomToBookIn?.GM.playerEmit('player_reservation', player.id)
                        // const playerToBook = roomToBookIn?.getPlayerById(roomBookingData.playerId)
                        break
                    default:
                        console.error('evento non gestito', clientEvent.name)
                        break;
                }
                break;
            default:
                console.error('tipologia evento non gestita', clientEvent.type)
                break;
        }
    }
}