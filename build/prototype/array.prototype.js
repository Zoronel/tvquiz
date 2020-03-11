"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Array.prototype.indexOfObjectWithProperty = function (propertyName, propertyValue) {
    for (let i in this) {
        const o = this[i];
        if (o.hasOwnProperty(propertyName) && o[propertyName] === propertyValue)
            return parseInt(i);
    }
    return -1;
};
Array.prototype.containsObjectWithProperty = function (propertyName, propertyValue) {
    return this.indexOfObjectWithProperty(propertyName, propertyValue) !== -1;
};
Array.prototype.getItemsWithProperty = function (propertyName, propertyValue, first) {
    if (first === undefined)
        first = true;
    const res = [];
    for (let i in this) {
        const o = this[i];
        if (o.hasOwnProperty(propertyName) && o[propertyName] === propertyValue) {
            if (first)
                return o;
            res.push(o);
        }
    }
    return res;
};
Array.prototype.first = function () {
    return this[0];
};
Array.prototype.last = function () {
    return this[this.length - 1];
};
//# sourceMappingURL=array.prototype.js.map