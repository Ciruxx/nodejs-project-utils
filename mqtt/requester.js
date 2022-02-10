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
const Boom = require('@hapi/boom');
const events = require('events');
const BSON = require('bson');

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
                this._events = new events.EventEmitter();
                this._mqtt.on('message', (topic, message) => {
                    this._events.emit(topic, {topic, message})
                });
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

    async disconnect() {
        console.log("Disconnect!");
        await this._mqtt.end(true);
    },

    async publish(topic, message) {
        await this._mqtt.publish(topic, message);
    },

    async subscribe(topic) {
        await this._mqtt.subscribe(topic);
    },

    async unsubscribe(topic) {
        await this._mqtt.unsubscribe(topic);
    },

    async request(category, name, action, json, {timeout = 20000, errorTrimLength = 100000} = {}) {
        return new Promise(async (resolve, reject) => {
            const messageId = Math.floor(Math.random() * 100000).toString();
            const requestTopic = `backend/${category}/${name}/${action}/request/${messageId}`;
            const responseTopic = `backend/${category}/${name}/${action}/response/${messageId}`;

            this.subscribe(responseTopic);

            let responseTimeout;

            const onMessage = async ({topic, message}) => {
                // console.log(requestTopic)
                // console.log(topic)
                if (topic === responseTopic) {

                    this.unsubscribe(responseTopic)
                    clearTimeout(responseTimeout);
                    this._events.removeListener(responseTopic, onMessage);

                    const stringMessage = message.toString();

                    // console.log("Arrivata la risposta con ID: "+messageId);
                    // console.log(stringMessage);

                    let json;
                    try {
                        json = JSON.parse(stringMessage);
                    } catch (e) {
                        console.error(`[${new Date().toISOString()}] Errore nel parsing: \nJSON: ${JSON.stringify(stringMessage)}`);
                        console.error(e);
                        return reject(Boom.internal("Internal Server Error."));
                    }

                    resolve(json);
                }
            };

            this._events.once(responseTopic, onMessage);

            responseTimeout = setTimeout(() => {

                this.unsubscribe(responseTopic)
                clearTimeout(responseTimeout);
                this._events.removeListener(responseTopic, onMessage);

                const inputJsonString = JSON.stringify(json);
                const trimmedString = inputJsonString.length > errorTrimLength ? inputJsonString.substring(0, errorTrimLength - 3) + "..." : inputJsonString
                console.error(`[${new Date().toISOString()}] Microservice unavailable: \nTopic: ${requestTopic} \nMessage: ${trimmedString}`);

                reject(Boom.gatewayTimeout("Microservice unavailable"));
            }, timeout);

            // console.log("Mandata la richiesta con ID: "+messageId);

            if (json === undefined || json === null)
                json = {};

            await this.publish(requestTopic, BSON.serialize(json));
        })
    },

    get client() {
        return this._mqtt;
    }
};
