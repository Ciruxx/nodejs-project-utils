const flatten = require('flat')

function toObject(object) {
    return flatten.unflatten(object);
}

function toDot(object) {
    return flatten(object);
}


module.exports = {
    toObject,
    toDot
}
