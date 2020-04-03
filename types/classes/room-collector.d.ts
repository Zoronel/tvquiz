import { Player } from './player.class';
import { Room } from "./room.class";
import { WebSocketServer } from './web-socket-server.class';
export declare class RoomCollector {
    static EVT_REFRESH_ROOM_LIST: string;
    private _server;
    private _rooms;
    private _counter;
    readonly lobby: Room;
    constructor(server: WebSocketServer);
    get server(): WebSocketServer;
    get rooms(): Room[];
    get roomsLite(): object[];
    get roomsNames(): String[];
    getRoom(id: number | string): Room | undefined;
    get playersCount(): Number;
    playerCount(id: number | string): Number;
    addRoom(roomName: String, gm?: Player | string, question?: string, players?: Player[]): Room;
    removeRoom(room: number | string | Room): void;
    movePlayer(playerId: string | Player, roomDest: number): void;
    roomListRefresh(): void;
    calcNewId(): number;
    isValidUsername(userName: String): {
        error: boolean;
        message: string;
    };
    private findPlayer;
}
//# sourceMappingURL=room-collector.d.ts.map