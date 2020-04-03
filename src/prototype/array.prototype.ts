export { }

declare global {
    interface Array<T> {
        indexOfObjectWithProperty(propertyName: string, propertyValue: any): number
        containsObjectWithProperty(propertyName: string, propertyValue: any): Boolean
        getItemsWithProperty<T>(propertyName: string, propertyValue: any, returnFirst: false): Array<T>
        getItemsWithProperty<T>(propertyName: string, propertyValue: any, returnFirst?: true): T | undefined
        first(): T
        last(): T
    }
}

Array.prototype.indexOfObjectWithProperty = function (propertyName: string, propertyValue: any): number {
    for (let i in this) {
        const o = this[i]
        if ((o.hasOwnProperty(propertyName) || o.__lookupGetter__(propertyName) != undefined) && o[propertyName] === propertyValue) return parseInt(i);
    }
    return -1;
}
Array.prototype.containsObjectWithProperty = function (propertyName: string, propertyValue: any): Boolean {
    return this.indexOfObjectWithProperty(propertyName, propertyValue) !== -1;
}
Array.prototype.getItemsWithProperty = function <T>(propertyName: string, propertyValue: any, first?: Boolean): Array<T> | T | undefined {
    if (first === undefined) first = true;
    const res: Array<T> = []
    for (let i in this) {
        const o = this[i];
        if ((o.hasOwnProperty(propertyName) || o.__lookupGetter__(propertyName) != undefined) && o[propertyName] === propertyValue) {
            if (first) return o;
            res.push(o);
        }
    }
    if (first && res.length == 0) return undefined
    return res;
}
Array.prototype.first = function () {
    return this[0]
}
Array.prototype.last = function () {
    return this[this.length - 1];
}