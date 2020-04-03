import { Player } from "./player.class";
import { Room } from "./room.class";

export class PlayerCollector {
    private collection: Player[]
    private _room?: Room
    constructor(room?: Room) {
        this.collection = []
        this._room = room
    }

    public set newElement(p: Player) {
        this.collection.push(p)
    }
    public get list(): Player[] {
        return this.collection
    }

    public get listIterable(): Player[] {
        return [...this.collection]
    }

    public collectGarbage(): void {
        const cleared: Player[] = this.collection.filter((p: Player, i: number) => {
            if (p == undefined) return false
            return true
        })
        delete this.collection
        this.collection = cleared
    }

    public resetList() {
        for (const p of this.collection) {
            p.playerEmit(Player.EVT_PLAYER_LEAVE_ROOM, undefined)
        }
        this.collection = []
    }

    private idxOfPlayerByName(userName: String): number {
        return this.collection.indexOfObjectWithProperty('userName', userName)
    }
    private idxOfPlayerById(id: string): number {
        return this.collection.indexOfObjectWithProperty('id', id)
    }

    public getPlayerByName(userName: String): Player | undefined {
        const idx = this.idxOfPlayerByName(userName)
        if (idx == -1) return undefined
        return this.collection[idx]
    }

    public getPlayerById(id: string): Player | undefined {
        const idx = this.idxOfPlayerById(id)
        if (idx == -1) return undefined
        return this.collection[idx]
    }

    public removePlayerByName(userName: String, kill?: boolean): boolean {
        console.log('Try remove Player [', userName, '] from [', this._room?.name || 'Global', ']')
        if (userName.sanitize().trim().length == 0) return false
        const idx = this.idxOfPlayerByName(userName)
        return this.removePlayerByIdx(idx, kill)
    }
    public removePlayerById(id: string, kill?: boolean): boolean {
        console.log('Try remove Player [', id, '] from [', this._room?.name || 'Global', ']')
        if (id.sanitize().trim().length == 0) return false
        const idx = this.idxOfPlayerById(id)
        return this.removePlayerByIdx(idx, kill)
    }

    public removePlayer(player: Player, kill?: boolean): boolean {
        console.log('Try remove Player [', player.userName, '] from [', this._room?.name || 'Global', ']')
        const idx = this.collection.indexOf(player)
        return this.removePlayerByIdx(idx, kill)
    }

    private removePlayerByIdx(idx: number, kill?: boolean): boolean {
        if (idx == -1) {
            console.error('Collection [', this._room?.name || 'Global', '] removePlayer. User not found')
            return false
        }
        const target: Player = this.collection[idx]
        console.log('Removing [', target.userName, '] from [', this._room?.name || 'Global', ']')
        if (target.connected) {
            target.playerEmit(Player.EVT_PLAYER_LEAVE_ROOM, undefined)
        }
        if (kill) delete this.collection[idx];
        this.collection.splice(idx, 1)
        if (this._room) this._room.refreshUserList()
        return true
    }
}