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
