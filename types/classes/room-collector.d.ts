import { Client } from './client.class';
import { Room } from "./room.class";
export declare class RoomCollector {
    private _rooms;
    private _counter;
    readonly lobby: Room;
    constructor();
    addRoom(roomName: String, gm?: Client, players?: Client[]): Room;
    removeRoom(roomId: number): void;
}
//# sourceMappingURL=room-collector.d.ts.map