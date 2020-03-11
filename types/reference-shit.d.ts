export declare type newtype = string | number;
export declare class Uncazzo {
    protected bar: newtype;
    private _robo?;
    constructor();
    /**
     * foo
     */
    foo(): boolean;
    protected get robo(): boolean | undefined;
    protected set robo(value: boolean | undefined);
}
export declare class Nulla extends Uncazzo {
    constructor();
    get pino(): newtype;
    set pino(v: newtype);
}
//# sourceMappingURL=reference-shit.d.ts.map