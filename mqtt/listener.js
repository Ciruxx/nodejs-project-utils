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
