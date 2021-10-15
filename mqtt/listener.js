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
const mqtt = require('mqtt');

module.exports = {
    /**
     * Connect to broker. You must wait for this before starting the server.
     * @returns {Promise}
     */
    async connect(url, options) {
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(url, options);

            client.on('connect', async () => {
                this._mqtt = client;
                console.log("[Mqtt] Connected");
                resolve(client);
            });

            client.on('error', (err) => {
                console.error(err);
                // reject(err)
            });

            client.on('offline', () => {
                console.log('Broker is not connected')
            });

            client.on('close', () => {
                console.log('Broker Connection Closed')
            });

            client.on('reconnect', () => {
                console.log('Broker Reconnection')
            });
        })
    },

    async disconnect(){
        console.log("Disconnect!");
    },

    async publish(topic, message){
        await this._mqtt.publish(topic, message);
    },

    async subscribe(topic){
        await this._mqtt.subscribe(topic);
    },

    get client() {
        return this._mqtt;
    }
};
