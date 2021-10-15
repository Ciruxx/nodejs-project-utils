const _ = require("lodash");
const clean = require('lodash-clean');
const Boom = require('@hapi/boom');

const base64Encode = str => (new Buffer(str)).toString('base64');
const base64Decode = str => Buffer.from(str, 'base64').toString('utf-8');

function cleanNullishKeys(value) {
    return _.pickBy(value, (x) => x != null);
}

const sanitizer = clean.buildCleaner({
    isArray: _.identity,
    isNull: _.noop,
    isString: _.identity
});

function appsyncBoomifier(error) {
    console.error(error);
    // JSON.stringify è necessario per Appsync, così attraverso i mapping templates si riesce a far ritornare un errore custom
    if (error.isJoi) {
        const boomJoiError = Boom.boomify(error, {statusCode: 400, override: false});
        return JSON.stringify(boomJoiError.output.payload);
    }
    if (Boom.isBoom(error)) {
        return JSON.stringify(error.output.payload);
    }
    return JSON.stringify(Boom.boomify(error, {statusCode: 500, override: false}).output.payload);
}

module.exports = {
    base64Encode,
    base64Decode,
    cleanNullishKeys,
    sanitizer,
    appsyncBoomifier
};
