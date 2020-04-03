import { Player } from './player.class';
import { Room } from './room.class';
import { SocketEvent } from './event.class';
import { PlayerCollector } from './player-collector';
export declare class WebSocketServer {
    private app;
    private cors;
    private http;
    private io;
    private building;
    private anagrafe;
    constructor();
    get allPlayers(): PlayerCollector;
    isValidUsername(userName: String): {
        error: boolean;
        message: string;
    };
    putInLobby(player: Player): void;
    publicEmit(eventName: string, data: any): void;
    publicEmit(event: SocketEvent): void;
    roomEmit(room: string | number | Room, eventName: string, data: any): void;
    private eventSort;
}
//# sourceMappingURL=web-socket-server.class.d.ts.map