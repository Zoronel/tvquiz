export class SocketEvent {
    static BASE_NAME = 'socket-event'

    private _origin?: string
    private _eventName?: string
    private _eventData: any
    private _creationDate: Date

    constructor(eventName: string, origin?: string, eventData?: any) {
        this.eventName = eventName
        this.origin = origin
        this.eventData = eventData
        this._creationDate = new Date()
    }
    public get eventName(): string {
        return this._eventName!
    }
    public set eventName(eventName: string) {
        eventName = eventName.sanitize().trim()
        if (eventName.length == 0) {
            console.error('FATAL ERROR. No eventName given to event contructor')
            throw ('FATAL ERROR. No eventName given to event contructor')
        }
        this._eventName = eventName
    }
    public get origin(): string | undefined {
        return this._origin!
    }
    public set origin(origin: string | undefined) {
        if (origin == undefined) {
            this._origin = 'Global'
        } else {
            origin = origin.sanitize().trim()
            if (origin.length == 0) origin = 'Global'
            this._origin = origin
        }
    }
    private set eventData(data: any) {
        if (data == undefined) data = {}
        this._eventData = data
    }

    public get event(): Object {
        let event = {
            type: this._origin,
            name: this._eventName,
            data: this._eventData,
            creationDate: this._creationDate.getTime(),
            creationDateStr: this._creationDate.toDateTimeIt()
        }
        return event
    }
}