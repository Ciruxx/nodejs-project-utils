const {lambda} = require("./sdk");

async function invoke(params) {
    return await lambda.invoke(params).promise()
}

module.exports = {
    invoke
}
