import { Player } from "./player.class";
import { RoomCollector } from "./room-collector";
import { PlayerCollector } from "./player-collector";
export declare class Room {
    static EVT_REFRESH_USERLIST: string;
    static EVT_NEW_QUESTION: string;
    static EVT_ROOM_CLOSING: string;
    private _id;
    private _isLobby;
    private _creationDate;
    private _name;
    private _question;
    private _GM?;
    private _players;
    private _roomCollector;
    constructor(roomCollector: RoomCollector, name?: String, gm?: Player, players?: Player[]);
    set question(v: String);
    get question(): String;
    get creationDate(): String;
    set newPlayer(newUser: Player | Player[]);
    get players(): PlayerCollector;
    get playersCount(): number;
    get playersName(): String[];
    get playersLite(): {
        id: string;
        userName: String;
        currentRoomId: number;
    }[];
    set GM(gm: Player);
    get GM(): Player;
    get id(): number;
    get name(): String;
    get isLobby(): boolean;
    private uniqueName;
    close(): void;
    resetPlayers(): void;
    refreshUserList(): void;
    roomEmit(eventName: string, data?: any, includeGM?: Boolean): void;
}
//# sourceMappingURL=room.class.d.ts.map