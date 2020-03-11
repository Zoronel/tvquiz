export { }
declare global {
    interface Date {
        toDateIt(separatore?: string): String
        toDateTimeIt(separatore?: string): String
        toDateEn(separatore?: string): String
        toDateTimeEn(separatore?: string): String
        toTime(seconds?: boolean): String
    }
}

Date.prototype.toDateIt = function (separatore): String {
    if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '/';
    let month = (this.getMonth() + 1).toString().padStart(2, '0'),
        day = '' + this.getDate().toString().padStart(2, '0'),
        year = this.getFullYear();

    return [day, month, year].join(separatore);
}

Date.prototype.toDateTimeIt = function (separatore) {
    if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '/';
    let month = (this.getMonth() + 1).toString().padStart(2, '0'),
        day = this.getDate().toString().padStart(2, '0'),
        year = this.getFullYear(),
        hour = this.getHours().toString().padStart(2, '0'),
        minute = this.getMinutes().toString().padStart(2, '0'),
        second = this.getSeconds().toString().padStart(2, '0');

    return [day, month, year].join(separatore) + ' ' + [hour, minute, second].join(':');
}

Date.prototype.toDateEn = function (separatore) {
    if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '-';
    let month = (this.getMonth() + 1).toString().padStart(2, '0'),
        day = '' + this.getDate().toString().padStart(2, '0'),
        year = this.getFullYear();

    return [year, month, day].join(separatore);
    // hour = this.getHours();
    // minute = this.getMinutes();
    // second = this.getSeconds();
}
Date.prototype.toDateTimeEn = function (separatore) {
    if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '-';
    let month = (this.getMonth() + 1).toString().padStart(2, '0'),
        day = this.getDate().toString().padStart(2, '0'),
        year = this.getFullYear(),
        hour = this.getHours().toString().padStart(2, '0'),
        minute = this.getMinutes().toString().padStart(2, '0'),
        second = this.getSeconds().toString().padStart(2, '0');

    return [year, month, day].join(separatore) + ' ' + [hour, minute, second].join(':');
}

Date.prototype.toTime = function (seconds) {
    if (seconds == undefined) seconds = false;
    let hour = this.getHours().toString().padStart(2, '0'),
        minute = this.getMinutes().toString().padStart(2, '0'),
        second = this.getSeconds().toString().padStart(2, '0');

    return seconds ? [hour, minute, second].join(':') : [hour, minute].join(':');
}