const {s3} = require("./sdk");

async function getObject(params) {
    return await s3.getObject(params).promise();
}

async function putObject(params) {
    return await s3.putObject(params).promise();
}

async function upload(params) {
    return await s3.upload(params).promise();
}

module.exports = {
    getObject,
    putObject,
    upload
}
