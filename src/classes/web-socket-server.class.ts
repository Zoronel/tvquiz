import * as express from 'express'
import * as socket from 'socket.io'
import * as httpFactory from 'http'
import { Client } from './client.class'
import { RoomCollector } from './room-collector'

export class WebSocketServer {
    private app: express.Application
    private http: httpFactory.Server
    private io: socket.Server

    private building: RoomCollector

    constructor() {
        this.app = express()
        this.http = httpFactory.createServer(this.app)
        this.io = socket()
        this.io.listen(this.http)
        this.http.listen(3000, () => {
            console.log('Server is Listening')
        })

        this.building = new RoomCollector()

        this.io.on('connection', (client: socket.Socket) => {
            console.log('CONNESSO', client)
            const tc = new Client(client);
            tc.skt.emit('whoyouare');
            this.building.lobby.player = tc
        })
    }
}