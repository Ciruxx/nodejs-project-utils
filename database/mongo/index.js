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
