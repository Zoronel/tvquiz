"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// import * as cors from 'cors'
const socket = require("socket.io");
const httpFactory = require("http");
const player_class_1 = require("./player.class");
const room_collector_1 = require("./room-collector");
const room_class_1 = require("./room.class");
const event_class_1 = require("./event.class");
const player_collector_1 = require("./player-collector");
class WebSocketServer {
    constructor() {
        this.cors = require('cors');
        const corsOptions = {
            origin: '*',
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204
        };
        this.app = express();
        this.app.use(this.cors(corsOptions));
        this.http = httpFactory.createServer(this.app);
        this.io = socket();
        this.io.listen(this.http);
        this.http.listen(3500, () => {
            console.log('Server is Listening on port 3000');
        });
        this.building = new room_collector_1.RoomCollector(this);
        this.anagrafe = new player_collector_1.PlayerCollector();
        setInterval(() => {
            this.anagrafe.collectGarbage();
            for (const p of this.anagrafe.listIterable) {
                if (!p.connected) {
                    if (p.currentRoom != undefined)
                        p.currentRoom.players.removePlayer(p);
                    if (this.anagrafe.removePlayer(p, true)) {
                        console.log('Orphan killed');
                    }
                }
                else if (p.isValid() && p.currentRoom == undefined) {
                    console.log('Orphan put in Lobby');
                    this.putInLobby(p);
                }
            }
        }, 30000);
        this.io.on('connection', (socket) => {
            console.log('NUOVA CONNESSIONE');
            const player = new player_class_1.Player(socket, this);
            this.anagrafe.newElement = player;
            player.skt.emit('whoyouare', { id: player.id });
            player.skt.on('client-event', (clientEvent) => {
                console.log('client-request', clientEvent.type, clientEvent.name);
                this.eventSort(player, clientEvent);
            });
        });
    }
    get allPlayers() {
        return this.anagrafe;
    }
    isValidUsername(userName) {
        return this.building.isValidUsername(userName);
    }
    putInLobby(player) {
        this.building.lobby.newPlayer = player;
    }
    publicEmit() {
        const args = arguments;
        let eventData;
        if (args.length = 0) {
            console.error('PublicEmit. No argument given');
        }
        else {
            if ((typeof args[0] != 'object' || (typeof args[0] == 'object' && !(args[0] instanceof event_class_1.SocketEvent))) && typeof args[0] != 'string') {
                throw ('First argument must be a event name or a SocketEvent Object');
            }
            if (typeof args[0] == 'object') {
                eventData = args[0].event;
            }
            else {
                eventData = new event_class_1.SocketEvent(args[0], '', args[1]).event;
            }
        }
        if (args.length > 2) {
            console.warn('Too many arguments passed. Extra wil be ignored');
        }
        this.io.sockets.emit(event_class_1.SocketEvent.BASE_NAME, eventData);
    }
    roomEmit(room, eventName, data) {
        let thisRoom;
        if (room instanceof room_class_1.Room) {
            thisRoom = room;
        }
        else {
            thisRoom = this.building.getRoom(room);
        }
        if (thisRoom == undefined) {
            console.error('Server.roomEmit. room not found', room, this.building);
            throw ('Given room identyfier is invalid');
        }
        thisRoom.roomEmit(eventName, data);
    }
    eventSort(player, clientEvent) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            switch (clientEvent.type) {
                case 'RoomCollector':
                    switch (clientEvent.name) {
                        case 'room_list':
                            let firstRoomList = new event_class_1.SocketEvent(room_collector_1.RoomCollector.EVT_REFRESH_ROOM_LIST, 'Global', { rooms: this.building.roomsLite });
                            player.connectionEmit(firstRoomList);
                            break;
                        case 'move_player':
                            const movePlayerData = clientEvent.data;
                            this.building.movePlayer(movePlayerData.playerId, movePlayerData.destRoomId);
                            break;
                        case 'close_room':
                            const roomId = clientEvent.data;
                            this.building.removeRoom(roomId);
                            break;
                        default:
                            console.error('evento non gestito', clientEvent.name);
                            break;
                    }
                    break;
                case 'Room':
                    switch (clientEvent.name) {
                        case 'get_room_info':
                            const id = clientEvent.data.id;
                            const thisRoom = this.building.getRoom(id);
                            if (thisRoom != undefined) {
                                let roomInfo = {
                                    roomName: thisRoom.name,
                                    roomId: thisRoom.id,
                                    roomQuestion: thisRoom.question,
                                    roomGm: ((_a = thisRoom.GM) === null || _a === void 0 ? void 0 : _a.userName) || '',
                                    roomGmId: ((_b = thisRoom.GM) === null || _b === void 0 ? void 0 : _b.id) || '',
                                    roomIsLobby: thisRoom.isLobby
                                };
                                const thisEvent = new event_class_1.SocketEvent('room_info', 'Room', roomInfo);
                                player.connectionEmit(thisEvent);
                            }
                            break;
                        case 'add_room':
                            const newRoomData = clientEvent.data;
                            const newRoom = this.building.addRoom(newRoomData.roomName, player, newRoomData.roomQuestion);
                            player.playerEmit('room_ready', newRoom.id);
                            break;
                        case 'room_booking':
                            const timeBooking = +new Date();
                            const roomToBookIn = player.currentRoom;
                            if (roomToBookIn && !roomToBookIn.isLobby) {
                                const bookingEvent = new event_class_1.SocketEvent('player_reservation', 'Room', { playerId: player.id, timeBooking: timeBooking });
                                roomToBookIn.GM.connectionEmit(bookingEvent);
                            }
                            else {
                                player.connectionEmit(new event_class_1.SocketEvent('error', 'Global', 'Errore durante la prenotazione della domanda'));
                            }
                            break;
                        case 'allow_answer':
                            const allowAnswerData = clientEvent.data;
                            const allowThisRoom = this.building.getRoom(allowAnswerData.roomId);
                            const allowThisUser = allowThisRoom === null || allowThisRoom === void 0 ? void 0 : allowThisRoom.players.getPlayerById(allowAnswerData.playerId);
                            allowThisUser === null || allowThisUser === void 0 ? void 0 : allowThisUser.playerEmit('answer_allowed', { result: true });
                            const userNotAllowed = (allowThisRoom === null || allowThisRoom === void 0 ? void 0 : allowThisRoom.players.list.filter(p => p.id != allowAnswerData.playerId)) || [];
                            for (const p of userNotAllowed) {
                                p.playerEmit('answer_allowed', { result: false, allowedUser: allowThisUser === null || allowThisUser === void 0 ? void 0 : allowThisUser.userName });
                            }
                            break;
                        case 'typing':
                            if (player.role == player_class_1.Player.ROLE_PLAYER) {
                                (_d = (_c = player.currentRoom) === null || _c === void 0 ? void 0 : _c.GM) === null || _d === void 0 ? void 0 : _d.connectionEmit(new event_class_1.SocketEvent('typing', 'Room', player.id));
                            }
                            else if (player.role == player_class_1.Player.ROLE_GM) {
                                player.currentRoom.roomEmit('gm_typing');
                            }
                            break;
                        case 'stop_typing':
                            if (player.role == player_class_1.Player.ROLE_PLAYER) {
                                (_f = (_e = player.currentRoom) === null || _e === void 0 ? void 0 : _e.GM) === null || _f === void 0 ? void 0 : _f.connectionEmit(new event_class_1.SocketEvent('stop_typing', 'Room', player.id));
                            }
                            else if (player.role == player_class_1.Player.ROLE_GM) {
                                player.currentRoom.roomEmit('gm_stop_typing');
                            }
                            break;
                        case 'new_answer':
                            const newAnswerRoom = player.currentRoom;
                            if (newAnswerRoom && !newAnswerRoom.isLobby) {
                                player.currentRoom.GM.connectionEmit(new event_class_1.SocketEvent('new_answer', 'Room', { playerId: player.id, answer: clientEvent.data }));
                            }
                            else {
                                player.connectionEmit(new event_class_1.SocketEvent('error', 'Global', 'Errore nell\'invio della risposta'));
                            }
                            break;
                        case 'answer_found':
                            (_g = player.currentRoom) === null || _g === void 0 ? void 0 : _g.roomEmit('answer_found', { playerId: clientEvent.data.playerId, answer: clientEvent.data.answer });
                            break;
                        case 'answer_not_found':
                            (_h = player.currentRoom) === null || _h === void 0 ? void 0 : _h.roomEmit('answer_not_found', { playerId: clientEvent.data.playerId });
                            break;
                        case 'player_surrender':
                            const surrenderRoom = player.currentRoom;
                            if (surrenderRoom && !surrenderRoom.isLobby) {
                                player.currentRoom.roomEmit('player_surrender', { playerId: player.id }, true);
                            }
                            else {
                                player.connectionEmit(new event_class_1.SocketEvent('error', 'Global', 'Errore nell\'invio della risposta'));
                            }
                            break;
                        case 'new_question':
                            const question = clientEvent.data.trim();
                            if (question.length == 0) {
                                player.connectionEmit(new event_class_1.SocketEvent('error', 'Global', 'Errore nel salvataggio della nuova domanda'));
                            }
                            else {
                                player.currentRoom.question = question;
                            }
                            break;
                        default:
                            console.error('evento non gestito', clientEvent.name);
                            break;
                    }
                    break;
                default:
                    console.error('tipologia evento non gestita', clientEvent.type);
                    break;
            }
        }
        catch (error) {
            console.error(error);
            player.connectionEmit(new event_class_1.SocketEvent('error', 'Global', error.toString()));
        }
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=web-socket-server.class.js.map