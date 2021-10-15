const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});
const s3 = new AWS.S3();
const kinesis = new AWS.Kinesis({apiVersion: '2013-12-02'});
const lambda = new AWS.Lambda();

module.exports = {
    AWS,
    dynamoDb,
    s3,
    kinesis,
    lambda
}
