import { WebSocketServer } from './classes/web-socket-server.class'
import './prototype'
try {
    const WSS = new WebSocketServer()
} catch (error) {
    console.error(error)
}