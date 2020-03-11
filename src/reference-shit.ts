export type newtype = string | number
export class Uncazzo {
	protected bar: newtype
	private _robo?: boolean

	constructor() {
		this.bar = 'ROBE'
	}
	/**
	 * foo
	 */
	public foo(): boolean {
		return true
	}
	protected get robo(): boolean | undefined {
		return this._robo
	}
	protected set robo(value: boolean | undefined) {
		this._robo = value
	}
}

export class Nulla extends Uncazzo {

	constructor() {
		super()
	}
	public get pino(): newtype {
		return this.bar
	}

	public set pino(v: newtype) {
		this.bar = v;
	}


}
