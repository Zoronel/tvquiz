"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.sanitize = function (placeHolder) {
    if (this.length == 0)
        return '';
    if (placeHolder == undefined)
        placeHolder = '';
    return this.replace(/[^\s\d\w]+/gi, placeHolder).replace(/\s+/, ' ');
};
String.prototype.isUrl = function () {
    if (this.trim().length == 0)
        return false;
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3})|' + // OR ip (v4) address
        'localhost)' + // or localhost
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(this.toString());
};
//# sourceMappingURL=string.prototype.js.map