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
