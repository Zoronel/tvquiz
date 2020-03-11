import * as socket from 'socket.io'

export class Client {
    static ROLE_ND: Number = -1
    static ROLE_GM: Number = 1
    static ROLE_PLAYER: Number = 2

    public skt: socket.Socket
    readonly id: string
    private validClient: Boolean = false
    private _userName: String = ''
    private _role: Number = Client.ROLE_ND

    constructor(client: socket.Socket) {
        // console.log(client);
        this.skt = client;
        this.skt.on('whoiam', this.defineIdentity);
        this.id = client.id
    }

    private defineIdentity(data: { name: String, role: number }): void {
        console.log(data.name, data.role);
        try {
            let name: String = data.name
            name = name.sanitize()
            if (name.length == 0) throw ('Il nome risulta vuoto')
            if (name.length > 16) throw ('Il nome è troppo lungo');
            this._userName = name

            let role: Number = data.role
            if (role <= 0 || role > 2) throw ('Il ruolo selezionato non è valido')
            this._role = role

            this.validClient = true

            this.skt.emit('welcome', { name: this._userName, role: this._role, id: this.id })
        } catch (error) {
            console.log(error);
            this.skt.emit('error', error)
            this.validClient = false
        }
    }
    public get userName(): String {
        return this._userName
    }
    public get role(): Number {
        return this._role
    }
    public isValid(): Boolean {
        return this.validClient
    }
}