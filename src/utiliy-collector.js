/*
Recupera le differenze tra due stringhe. Non è preciso al 100%, ma da una buona base di partenza.
var x = 'stringa';
x.getDifference('sstringa');
rispetto alla stringa originale
return {
	added:'s',
	removed:'tringa'
}
*/
Object.defineProperty(String.prototype, 'getDifference', {
    value: function (string) {
        if (typeof string != 'string') {
            throw new Error('il valore passato non è una stringa');
        }
        if (typeof string == 'undefined' || string === null || string.trim().length <= 0) {
            return this;
        }
        var i = 0;
        var j = 0;
        var result = { added: '', removed: '' };

        while (j < string.length) {
            if (this[i] != string[j] || i == this.length)
                result.added += string[j];
            else
                i++;
            j++;
        }
        i = 0;
        j = 0;
        while (j < this.length) {
            if (string[i] != this[j] || i == string.length)
                result.removed += this[j];
            else
                i++;
            j++;
        }
        return result;
    },
    enumerable: false,
    writable: false
});

/**
Controlla se la stringa in questione è un'url di qualche tipo
return Boolean
**/
Object.defineProperty(String.prototype, 'isUrl', {
    value: function () {

        if (this.trim().length == 0) return false;

        let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3})|' + // OR ip (v4) address
            'localhost)' + // or localhost
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern.test(this);

    },
    enumerable: false,
    writable: false
});

/**
Pulisce la stringa da ogni carattere non idoneo (non varchar o spazio) e dimuove eventuali doppi spazzi
**/
Object.defineProperty(String.prototype, 'sanitize', {
    value: function (placeHolder) {
        if (this == '' || this == undefined) return '';
        if (placeHolder == null || typeof placeHolder != 'string') placeHolder = '';
        return this.replace(/[^\s\d\w]+/gi, placeHolder).replace(/\s+/, ' ');
    },
    enumerable: false,
    writable: false
});

/**
Ritorna l'indice di un'oggetto che abbia una property con uno specifico valore

var arr = [
	{foo:'a'},
	{foo:'b'}
	{foo:'c'}
	{foo:'d'}
]
arr.indexOfObjectWithProperty('foo', 'a');
return 0;

funziona con ogni tipo di valore, in quanto fa il controllo stretto.
ritorna il primo risultato trovato
**/
Object.defineProperty(Array.prototype, 'indexOfObjectWithProperty', {
    value: function (propertyName, propertyValue) {
        for (let i in this) {
            let o = this[i];
            if (o.hasOwnProperty(propertyName) && o[propertyName] === propertyValue) return i;
        }

        return -1;
    },
    enumerable: false,
    writable: false
});
/**come sopra ma ritorna true o false**/
Object.defineProperty(Array.prototype, 'containsObjectWithProperty', {
    value: function (propertyName, propertyValue) {
        return this.indexOfObjectWithProperty(propertyName, propertyValue) !== -1;
    },
    enumerable: false,
    writable: false
});
Object.defineProperty(Array.prototype, 'getItemsWithProperty', {
    value: function (propertyName, propertyValue, first) {
        first = Boolean.parseBoolean(first);
        if (first === undefined) first = true;
        let res = []
        for (let i in this) {
            let o = this[i];
            if (o.hasOwnProperty(propertyName) && o[propertyName] === propertyValue) {
                if (first) return o;
                res.push(o);
            }
        }

        return res;
    },
    enumerable: false,
    writable: false
});
Object.defineProperty(Array.prototype, 'first', {
    get: function () {
        return this[0];
    }
});

Object.defineProperty(Array.prototype, 'last', {
    get: function () {
        return this[this.length - 1];
    }
});
/**
Tenta di parsare un valore passato in un booleano
Boolean.parseBoolean('1'); \\true
Boolean.parseBoolean(1); \\true
Boolean.parseBoolean('true'); \\true
Boolean.parseBoolean('0'); \\false
...
Boolean.parseBoolean('gino'); \\undefined
Boolean.parseBoolean({foo:'bar'}); \\undefined
...
**/
Object.defineProperty(Boolean, 'parseBoolean', {
    value: function (mixed) {
        if (mixed == null) {
            return undefined;
        }
        var type = typeof mixed;
        switch (type) {
            case 'string':
                var tmp = mixed.toLowerCase().trim().replace(/\s+/g, '');
                if (tmp.match(/(true|vero|1){1}/g)) {
                    return true;
                } else if (tmp.match(/(false|falso|0){1}/g)) {
                    return false;
                }
                break;
            case 'number':
                if (mixed == 1) {
                    return true;
                } else if (mixed == 0) {
                    return false;
                };
                break;
            case 'boolean':
                return mixed;
            default:
                return undefined;
        }
        return undefined;
    },
    enumerable: false,
    writable: false,
    configurable: false
});
/**
Cerca di capire se quello che gli è stato passato può essere una data valida
Date.isValidDate('01/01/1900') \\ true
Date.isValidDate('35/02/1900') \\ false
...
var errorsLog = {}
Date.isValidDate('35/02/1900', errorsLog) \\ false
errorsLog.description = 'Day 35 is an invalid value'
...
Accetta stringhe o oggetti Date precedentemente inizializzati.
var dt = new Date();
Date.isValidDate(dt) \\ true;

var dt = new Date('gino');
Date.isValidDate(dt) \\ false;

Può essere esteso con facilità per accettare formati ulteriori a quelli standard 
[dd/mm/yyyy hh:mm:ss, yyyy-mm-dd hh:mm:ss]
**/
Object.defineProperty(Date, 'isValidDate', {
    value: function (mixed, error) {
        if (error == undefined || (error != undefined && typeof error != 'object')) error = {};
        if (typeof mixed == 'object') {
            if (mixed instanceof Date && !isNaN(mixed.getDate())) {
                return true;
            } else {
                error.code = 0;
                error.description = 'Tested value is an Object or an invalid Date()';
                return false;
            }
        } else if (typeof mixed == 'string') {
            let test = new Date(mixed);
            if (!isNaN(test.getDate())) return true;
            let type = -1;
            if (mixed.match(/^\d{4}([\\/-]{1}\d{2}){2}( \d{1,2}(:\d{1,2}){2})?$/)) {
                //datetime eng
                type = 0;
            } else if (mixed.match(/^(\d{2}[\\/-]{1}){2}\d{4}( \d{1,2}(:\d{1,2}){2})?$/)) {
                //datetime it
                type = 1;
            } else {
                error.code = 1;
                error.description = 'Unhandled format. accepted format [dd/mm/yyyy hh:mm:ss, yyyy-mm-dd hh:mm:ss]';
                return false;
                // throw 'Attesa una data. La stringa ricevuta non è in un formato corretto';
            }
            let date = ''
                , time = '';

            if (mixed.indexOf(' ') > -1) {
                [date, time] = mixed.split(' ');
            } else {
                date = mixed;
            }
            date = date.trim();
            time = time.trim();

            let separatore = '';
            if (date.indexOf('-') > -1) {
                separatore = '-';
            } else if (date.indexOf('/') > -1) {
                separatore = '/';
            } else if (date.indexOf('\\') > -1) {
                separatore = '\\';
            } else {
                error.code = 2;
                error.description = 'No handled separator found on tested value';
                return false;
            }
            let day = ''
                , month = ''
                , year = '';

            if (type == 0) {
                [year, month, day] = date.split(separatore);
            } else {
                [day, month, year] = date.split(separatore);
            }
            day = parseInt(day);
            month = parseInt(month);
            year = parseInt(year);
            if (month > 12 || month < 1) {
                error.code = 31;
                error.description = 'Month ' + month + ' is an invalid value';
                return false;
            }
            if (day > 31 || day < 1) {
                error.code = 32;
                error.description = 'Day ' + day + ' is an invalid value';
                return false;
            }
            switch (month) {
                case 2:
                    if (day > 28) {
                        error.code = 32;
                        error.description = 'Day ' + day + ' is an invalid value';
                        return false;
                    }
                    break;
                case 4:
                case 6:
                case 9:
                case 11:
                    if (day > 30) {
                        error.code = 32;
                        error.description = 'Day ' + day + ' is an invalid value';
                        return false;
                    }
                    break;
            }
            let timeErr = {};
            if (time != '' && !Date.isValidTime(time, timeErr)) {
                error.code = timeErr.code;
                error.description = timeErr.description;
                return false;
            } else {
                return true;
            }
        } else {
            error.code = -1;
            error.description = 'Unexpected value type. Only String or Date() was accepted';
            return false;
        }
    },
    enumerable: false,
    writable: false,
    configurable: false
});
/**Come sopra ma con il tempo. Accetta solo stringhe**/
Object.defineProperty(Date, 'isValidTime', {
    value: function (time, error) {
        if (error == undefined || (error != undefined && typeof error != 'object')) error = {};
        if (typeof time != 'string') {
            error.code = -1;
            error.description = 'Unexpected value type. Only string was allowed';
            return false;
        }
        if (!time.match(/^\d{1,2}(:\d{1,2}){0,2}$/)) {
            error.code = 1;
            error.description = 'Unhandled format. accepted format hh:mm:ss';
            return false;
        }
        let hours = ''
            , minutes = ''
            , seconds = '';
        [hours, minutes, seconds] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        if (isNaN(minutes)) minutes = 0;
        seconds = parseInt(seconds);
        if (isNaN(seconds)) seconds = 0;
        if (hours > 24 || hours < 0) {
            error.code = 31;
            error.description = 'Value ' + hours + ' was an invalid hour';
            return false;
        }
        if (minutes > 60 || minutes < 0) {
            error.code = 32;
            error.description = 'Value ' + minutes + ' was an invalid minute';
            return false;
        }
        if (seconds > 60 || seconds < 0) {
            error.code = 33;
            error.description = 'Value ' + seconds + ' was an invalid second';
            return false;
        }
        return true;
    }
});

Object.defineProperty(Date.prototype, 'toDateIt', {
    value: function (separatore) {
        if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '/';
        let month = (this.getMonth() + 1).toString().padStart(2, '0'),
            day = '' + this.getDate().toString().padStart(2, '0'),
            year = this.getFullYear();

        return [day, month, year].join(separatore);
        // hour = this.getHours();
        // minute = this.getMinutes();
        // second = this.getSeconds();
    },
    enumerable: false,
    writable: false,
    configurable: false
});

Object.defineProperty(Date.prototype, 'toDateTimeIt', {
    value: function (separatore) {
        if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '/';
        let month = (this.getMonth() + 1).toString().padStart(2, '0'),
            day = this.getDate().toString().padStart(2, '0'),
            year = this.getFullYear(),
            hour = this.getHours().toString().padStart(2, '0'),
            minute = this.getMinutes().toString().padStart(2, '0'),
            second = this.getSeconds().toString().padStart(2, '0');

        return [day, month, year].join(separatore) + ' ' + [hour, minute, second].join(':');
    },
    enumerable: false,
    writable: false,
    configurable: false
});

Object.defineProperty(Date.prototype, 'toDateEn', {
    value: function (separatore) {
        if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '-';
        let month = (this.getMonth() + 1).toString().padStart(2, '0'),
            day = '' + this.getDate().toString().padStart(2, '0'),
            year = this.getFullYear();

        return [year, month, day].join(separatore);
        // hour = this.getHours();
        // minute = this.getMinutes();
        // second = this.getSeconds();
    },
    enumerable: false,
    writable: false,
    configurable: false
});

Object.defineProperty(Date.prototype, 'toDateTimeEn', {
    value: function (separatore) {
        if (separatore == undefined || ['-', '/'].indexOf(separatore) == -1) separatore = '-';
        let month = (this.getMonth() + 1).toString().padStart(2, '0'),
            day = this.getDate().toString().padStart(2, '0'),
            year = this.getFullYear(),
            hour = this.getHours().toString().padStart(2, '0'),
            minute = this.getMinutes().toString().padStart(2, '0'),
            second = this.getSeconds().toString().padStart(2, '0');

        return [year, month, day].join(separatore) + ' ' + [hour, minute, second].join(':');
    },
    enumerable: false,
    writable: false,
    configurable: false
});

Object.defineProperty(Date.prototype, 'toTime', {
    value: function (seconds) {
        if (seconds == undefined || typeof seconds != 'boolean') seconds = false;
        let hour = this.getHours().toString().padStart(2, '0'),
            minute = this.getMinutes().toString().padStart(2, '0'),
            second = this.getSeconds().toString().padStart(2, '0');

        return seconds ? [hour, minute, second].join(':') : [hour, minute].join(':');
    },
    enumerable: false,
    writable: false,
    configurable: false
});

function isBlank() {
    var args = arguments;
    if (args.length == 0) return true;

    for (var i = 0; i < args.length; i++) {
        var obj = args[i];
        if (obj === null) return true;
        var type = typeof obj;
        switch (type) {
            case 'undefined':
                return true;
            case 'object':
                if (obj instanceof Array) {
                    if (obj.length <= 0) return true;
                } else if (obj instanceof Date) {
                    if (obj == 'Invalid Date') return true;
                } else if (Object.prototype.toString.call(obj) == '[object Object]') {
                    var keyName = Object.getOwnPropertyNames(obj);
                    if (keyName.length <= 0) return true;
                } else {
                    return false;
                }
                break;
            case 'string':
                if (obj.trim().length <= 0) {
                    return true;
                }
                break;
            case 'number':
                if (isNaN(obj)) {
                    return true;
                };
                break;
        }
    }

    return false;
}