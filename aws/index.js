const {put, update, scan, query, batchWrite, deleteElements} = require("./dynamodb");
const {putRecord, putRecords} = require("./kinesis");
const {invoke} = require("./lambda");
const {getObject, putObject, upload} = require("./s3");
const {s3, dynamoDb, kinesis, lambda} = require("./sdk");

module.exports = {
    DynamoDB: {
        dynamoDb,
        put,
        update,
        scan,
        query,
        batchWrite,
        deleteElements
    },
    Kinesis: {
        kinesis,
        putRecord,
        putRecords
    },
    Lambda: {
        lambda,
        invoke
    },
    S3: {
        s3,
        getObject,
        putObject,
        upload
    },
};
