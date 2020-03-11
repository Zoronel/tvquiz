import * as socket from 'socket.io';
export declare class Client {
    static ROLE_ND: Number;
    static ROLE_GM: Number;
    static ROLE_PLAYER: Number;
    skt: socket.Socket;
    readonly id: string;
    private validClient;
    private _userName;
    private _role;
    constructor(client: socket.Socket);
    private defineIdentity;
    get userName(): String;
    get role(): Number;
    isValid(): Boolean;
}
//# sourceMappingURL=client.class.d.ts.map