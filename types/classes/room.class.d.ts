import { Client } from "./client.class";
export declare class Room {
    private _id;
    private _creationDate;
    private _name;
    private _question;
    private _GM?;
    private _players;
    constructor(assignedId: Number, name?: String, gm?: Client, players?: Client[]);
    set question(v: String);
    get question(): String;
    get creationDate(): String;
    set player(player: Client | Client[]);
    get players(): Client[];
    set GM(gm: Client);
    get GM(): Client;
    get id(): Number;
    resetPlayers(): void;
    private removePlayerByName;
    private removePlayerByIndex;
    removePlayer(id: String): void;
}
//# sourceMappingURL=room.class.d.ts.map