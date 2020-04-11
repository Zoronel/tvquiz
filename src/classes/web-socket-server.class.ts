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
        this.http.listen(3500, () => {
            console.log('Server is Listening on port 3500')
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
            throw ('Given room identyfier is invalid')
        }
        thisRoom.roomEmit(eventName, data)
    }

    private eventSort(player: Player, clientEvent: { type: string; name: string; data: any }) {
        try {


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
                                    roomGm: thisRoom.GM?.userName || '',
                                    roomGmId: thisRoom.GM?.id || '',
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
                            const roomToBookIn: Room = player.currentRoom
                            if (roomToBookIn && !roomToBookIn.isLobby) {
                                const bookingEvent: SocketEvent = new SocketEvent('player_reservation', 'Room', { playerId: player.id, timeBooking: timeBooking })
                                roomToBookIn.GM.connectionEmit(bookingEvent)
                            } else {
                                player.connectionEmit(new SocketEvent('error', 'Global', 'Errore durante la prenotazione della domanda'))
                            }
                            break
                        case 'allow_answer':
                            const allowAnswerData: { roomId: number, playerId: string } = clientEvent.data
                            const allowThisRoom = this.building.getRoom(allowAnswerData.roomId)
                            const allowThisUser = allowThisRoom?.players.getPlayerById(allowAnswerData.playerId)
                            allowThisUser?.playerEmit('answer_allowed', { result: true })
                            const userNotAllowed: Player[] = allowThisRoom?.players.list.filter(p => p.id != allowAnswerData.playerId) || []
                            for (const p of userNotAllowed) {
                                p.playerEmit('answer_allowed', { result: false, allowedUser: allowThisUser?.userName })
                            }
                            break
                        case 'typing':
                            if (player.role == Player.ROLE_PLAYER) {
                                player.currentRoom?.GM?.connectionEmit(new SocketEvent('typing', 'Room', player.id))
                            } else if (player.role == Player.ROLE_GM) {
                                player.currentRoom.roomEmit('gm_typing')
                            }
                            break
                        case 'new_answer':
                            const newAnswerRoom: Room = player.currentRoom
                            if (newAnswerRoom && !newAnswerRoom.isLobby) {
                                player.currentRoom.GM.connectionEmit(new SocketEvent('new_answer', 'Room', { playerId: player.id, answer: clientEvent.data }))
                            } else {
                                player.connectionEmit(new SocketEvent('error', 'Global', 'Errore nell\'invio della risposta'))
                            }
                            break
                        case 'answer_found':
                            player.currentRoom?.roomEmit('answer_found', { playerId: clientEvent.data.playerId, answer: clientEvent.data.answer })
                            break
                        case 'answer_not_found':
                            player.currentRoom?.roomEmit('answer_not_found', { playerId: clientEvent.data.playerId })
                            break
                        case 'player_surrender':
                            const surrenderRoom: Room = player.currentRoom
                            if (surrenderRoom && !surrenderRoom.isLobby) {
                                player.currentRoom.roomEmit('player_surrender', player.id, true)
                            } else {
                                player.connectionEmit(new SocketEvent('error', 'Global', 'Errore nell\'invio della risposta'))
                            }
                            break
                        case 'new_question':
                            const question: string = clientEvent.data.trim()
                            if (question.length == 0) {
                                player.connectionEmit(new SocketEvent('error', 'Global', 'Errore nel salvataggio della nuova domanda'))
                            } else {
                                player.currentRoom.question = question
                            }
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
        } catch (error) {
            console.error(error)
            player.connectionEmit(new SocketEvent('error', 'Global', error.toString()))

        }
    }
}