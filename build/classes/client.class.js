"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(client) {
        this.validClient = false;
        this._userName = '';
        this._role = Client.ROLE_ND;
        // console.log(client);
        this.skt = client;
        this.skt.on('whoiam', this.defineIdentity);
        this.id = client.id;
    }
    defineIdentity(data) {
        console.log(data.name, data.role);
        try {
            let name = data.name;
            name = name.sanitize();
            if (name.length == 0)
                throw ('Il nome risulta vuoto');
            if (name.length > 16)
                throw ('Il nome è troppo lungo');
            this._userName = name;
            let role = data.role;
            if (role <= 0 || role > 2)
                throw ('Il ruolo selezionato non è valido');
            this._role = role;
            this.validClient = true;
            this.skt.emit('welcome', { name: this._userName, role: this._role, id: this.id });
        }
        catch (error) {
            console.log(error);
            this.skt.emit('error', error);
            this.validClient = false;
        }
    }
    get userName() {
        return this._userName;
    }
    get role() {
        return this._role;
    }
    isValid() {
        return this.validClient;
    }
}
exports.Client = Client;
Client.ROLE_ND = -1;
Client.ROLE_GM = 1;
Client.ROLE_PLAYER = 2;
//# sourceMappingURL=client.class.js.map