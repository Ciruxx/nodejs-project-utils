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
const {dynamoDb} = require("./sdk");

async function scan(params) {
    let scanResults = [];
    let items;
    do {
        items = await dynamoDb.scan(params).promise().catch((error) => ({error}));
        if (items.error) {
            console.error(items.error)
            throw new Error(items.error)
        }
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }
    while (typeof items.LastEvaluatedKey != "undefined");

    return scanResults;
}

async function query(params) {
    return await dynamoDb.query(params).promise();
}

async function put(params) {
    return await dynamoDb.put(params).promise();
}

async function update(params) {
    const res = await dynamoDb.update(params).promise();
    return res.Items;
}

async function deleteElements(data, dynamodbTable) {
    const chunks = _.chunk(data, 25)
    for (const chunk of chunks) {
        const params = {
            RequestItems: {
                [dynamodbTable]: chunk
            }
        };

        await batchWrite(params);
    }
}

async function batchWrite(params) {
    return await dynamoDb.batchWrite(params).promise();
}

module.exports = {
    put,
    update,
    scan,
    query,
    batchWrite,
    deleteElements
}
