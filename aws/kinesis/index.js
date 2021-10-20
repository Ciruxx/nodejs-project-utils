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

const _ = require('lodash');
const {kinesis} = require("../sdk");

async function putRecords(kinesStreamName, partitionKey, array, chunkSize = 250) {
    const records = array.map((element) => {
        return {
            Data: JSON.stringify(element),
            PartitionKey: partitionKey
        }
    });
    console.log("[Kinesis] Stampa del primo Record: ", records[0]);

    const chunks = _.chunk(records, chunkSize);
    console.log("[Kinesis] Numero di Chunks: ", chunks.length);

    for (const chunk of chunks) {
        const params = {
            StreamName: kinesStreamName,
            Records: chunk
        };
        try {
            const res = await kinesis.putRecords(params).promise();
            if (res.FailedRecordCount > 0) {
                console.error(`[Kinesis] ERRORE fatale!`);
                console.error(`[Kinesis] Errore nell'invio su ${kinesStreamName}`);
                console.error(res);
                console.error(`[Kinesis] Params:`);
                console.error(params);
                return;
            }
        } catch (e) {
            console.error(`[Kinesis] ERRORE fatale!`);
            console.error(`[Kinesis] Errore nell'invio su ${kinesStreamName}`);
            console.error(e);
            console.error(`[Kinesis] Params:`);
            console.error(params);
            return;
        }
    }
    console.log("[Kinesis] Invio completato");
}

async function putRecord(params) {
    return await kinesis.putRecord(params).promise()
}

module.exports = {
    putRecord,
    putRecords
}
