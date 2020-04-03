import * as socket from 'socket.io';
import { WebSocketServer } from './web-socket-server.class';
import { Room } from './room.class';
export declare class Client {
    static ROLE_ND: Number;
    static ROLE_GM: Number;
    static ROLE_PLAYER: Number;
    private _server;
    skt: socket.Socket;
    readonly id: string;
    private validClient;
    private _userName;
    private _role;
    private _currenRoom?;
    constructor(client: socket.Socket, server: WebSocketServer);
    private defineIdentity;
    get userName(): String;
    get role(): Number;
    set currentRoom(room: Room);
    get currentRoom(): Room;
    isValid(): Boolean;
}
//# sourceMappingURL=client.class.d.ts.map