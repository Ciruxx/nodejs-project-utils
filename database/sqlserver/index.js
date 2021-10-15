const sql = require('mssql');
const _ = require('lodash');

module.exports = {
    async connect({user, password, server, database}) {
        if (this._db) return this._db; // for lambda optimization

        this._db = await sql.connect({
            user, password, server, database,
            options: {
                enableArithAbort: true,
                encrypt: true,
                abortTransactionOnError: true
            }
        });
        console.log("[SQLServer] Connected!")
    },

    async query(tsql = `SELECT TOP 3 t.* FROM test.dbo.test t`) {
        return await this._db.query(tsql)
    },

    async bulkWrite(jsonArray, database = 'test', schema = 'dbo', table = 'test') {
        if (!jsonArray[0]) throw new Error("An element is required!");
        if (jsonArray.length > 1000) throw new Error("The max for a single insert is 1000 records!");

        const query = buildInsertIntoQuery(jsonArray, database, schema, table);

        return await this.query(query)
    },
    async bulkWriteTransaction(jsonArray, database = 'test', schema = 'dbo', table = 'test') {
        if (!jsonArray[0]) {
            throw new Error("An element is required!")
        }

        const chunks = _.chunk(jsonArray, 25); // Transaction optimization https://www.red-gate.com/simple-talk/sql/performance/comparing-multiple-rows-insert-vs-single-row-insert-with-three-data-load-methods/

        console.log("[SQLServer] Transaction Chunks: ", chunks.length);

        const transaction = new sql.Transaction()
        console.log("[SQLServer] Transaction Begin");
        await transaction.begin()

        transaction.on('rollback', aborted => {
            // emited with aborted === true
            console.error("[SQLServer] ERROR: Transaction rolled back!")
        })

        const request = new sql.Request(transaction)

        console.log("[SQLServer] Transaction Query begin");
        for (const chunk of chunks) {
            await request.query(buildInsertIntoQuery(chunk, database, schema, table));
        }
        console.log("[SQLServer] Transaction Query end");

        console.log("[SQLServer] Transaction Commit");
        return await transaction.commit();
    },

    async lastId(table) {
        const {recordset} = await this.query(`SELECT IDENT_CURRENT ('${table}') AS LAST_ID`);
        return recordset[0];
    },

    async disconnect() {
        if(this._db == null) return;
        const res = await this._db.close();
        this._db = null;
        return res;
    }
}

function buildInsertIntoQuery(jsonArray, database, schema, table) {
    const first = jsonArray[0];
    const keys = Object.keys(first);

    let fields = commaSeparated(keys);
    let values = '';
    for (const json of jsonArray) {
        const keys = Object.keys(json);
        const arrayOfValues = [];
        for (const key of keys) {
            switch (typeof json[key]) {
                case "string": {
                    arrayOfValues.push(`'${
                        json[key].replace(/'/g, "''")
                    }'`);
                    break;
                }
                case "object": {
                    if (json[key] == null) {
                        arrayOfValues.push(`NULL`);
                    }
                    break;
                }
                default: {
                    arrayOfValues.push(`'${
                        json[key]
                    }'`);
                    break;
                }
            }
        }
        values += `(${commaSeparated(arrayOfValues)}),`;
    }

    values = values.substring(0, values.length - 1);
    const query = `
        INSERT INTO ${database}.${schema}.${table} (${fields})
        VALUES ${values}
        `
    return query;
}

function commaSeparated(array) {
    let fields = '';
    for (const element of array) {
        fields += `${element},`;
    }
    fields = fields.substring(0, fields.length - 1);
    return fields;
}
