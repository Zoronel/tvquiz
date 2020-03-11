"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Uncazzo {
    constructor() {
        this.bar = 'ROBE';
    }
    /**
     * foo
     */
    foo() {
        return true;
    }
    get robo() {
        return this._robo;
    }
    set robo(value) {
        this._robo = value;
    }
}
exports.Uncazzo = Uncazzo;
class Nulla extends Uncazzo {
    constructor() {
        super();
    }
    get pino() {
        return this.bar;
    }
    set pino(v) {
        this.bar = v;
    }
}
exports.Nulla = Nulla;
//# sourceMappingURL=reference-shit.js.map