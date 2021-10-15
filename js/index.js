/*
 * Copyright (c) 2018-2021 Ciro Santillo<ciro1693@gmail.com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
