"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor(client, server) {
        this.validClient = false;
        this._userName = '';
        this._role = Client.ROLE_ND;
        // console.log(client);
        this.skt = client;
        this.id = client.id;
        this._server = server;
        this.skt.on('whoiam', this.defineIdentity());
    }
    defineIdentity() {
        const that = this;
        return function (data) {
            console.log('Client.identity', data.name, data.role);
            try {
                let name = data.name;
                name = name.sanitize();
                if (name.length == 0)
                    throw ('Il nome risulta vuoto');
                if (name.length > 16)
                    throw ('Il nome è troppo lungo');
                that._userName = name;
                let role = data.role;
                if (role <= 0 || role > 2)
                    throw ('Il ruolo selezionato non è valido');
                that._role = role;
                that.validClient = true;
                that._server.putInLobby(that);
            }
            catch (error) {
                console.log(error);
                that.skt.emit('error', error);
                that.validClient = false;
            }
        };
    }
    get userName() {
        return this._userName;
    }
    get role() {
        return this._role;
    }
    set currentRoom(room) {
        this._currenRoom = room;
    }
    get currentRoom() {
        return this._currenRoom;
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