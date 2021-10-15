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

'use strict';
const {ObjectId} = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    /**
     * Connect to mongo database. You must wait for this before starting the server.
     * @returns {Promise}
     */
    async connect(url, database) {
        if (this._db != null) {
            console.log('[MongoDB] Already Connected!');
            return this._db
        }
        const client = await MongoClient.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        this._db = client.db(database);
        console.log('[MongoDB] Connected!');
        this._client = client;
        return this._db
    },

    checkConnection() {
        if (!this._db.serverConfig.isConnected()) {
            throw Error("[MongoDB] Not connected!");
        }
    },

    createSession() {
        return this._client.startSession({
            readPreference: 'primary',
            readConcern: {level: 'local'},
            writeConcern: {w: 'majority'}
        })
    },
    async withTransaction(callback, args) {
        const session = this.createSession();
        let res = null;
        try {
            const sessionRes = await session.withTransaction(async () => {
                res = await callback(...args, session)
            })
            if (sessionRes == null) {
                throw new Error("[MongoDB] Transaction Error! Are you sure you used transactions at least once in the call?")
            }
            if (sessionRes.result.ok !== 1) {
                console.error(sessionRes);
                throw new Error("[MongoDB] Transaction Error!")
            }
        } finally {
            session.endSession();
        }
        return res
    },

    async disconnect() {
        console.log("[MongoDB] Disconnected!");
        return await this._client.close();
    },

    get db() {
        return this._db;
    },
    get client() {
        return this._client;
    },
    get ObjectId() {
      return ObjectId;
    }
};
