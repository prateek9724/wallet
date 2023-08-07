const { MONGO_SERVER_ERROR } = require("../lib/utils");

const { ExpressApp, initDefaultOptions, initialze, initValidateOptions } = require("../lib/nodev1"),
    { addMongoDbOptions, initMongoClient } = require('../lib/mongodb-utls'),
    asMain = (require.main === module);

const parseOptions = (argv) => {
    let cmd = initDefaultOptions(1605);
    cmd = addMongoDbOptions(cmd);
    return cmd
        .parse(argv)
        .opts();
}

const initResources = async (options) => {
    return await initialze(options)
        .then(initValidateOptions('mongoUrl'))
        .then(initMongoClient)
}

const collections = [
    {
        col_name: 'transactions',
        indexes: [
            { key: { walletId: 1 }, options: { name: 'Wallet Id Search Index' } }
        ]
    },
    {
        col_name: 'wallets',
        schemaValidor: {
            $jsonSchema: {
                bsonType: "object",
                title: "Wallet balance Validation",
                properties: {
                    "balance": {
                        bsonType: "decimal",
                        minimum: 0,
                        description: "Value of 'balance' field must be a decimal and should not be less than 0."
                    }
                },
                additionalProperties: true
            }
        }
    }
]

class MongoSchema extends ExpressApp {

    constructor(context) {
        super(context);
        this.db = context.db;
        this.mongoClient = context.mongoClient;
        this.initSchema();
    }


    async initSchema() {
        try {
            for (let collection of collections) {
                const { col_name, indexes = [], schemaValidor } = collection;
                const dbCol = this.db.collection(col_name);
                for (const index of indexes) {
                    await this.createIndex(dbCol, index)
                }
                if (schemaValidor && Object.keys(schemaValidor).length) {
                    await this.applySchemaValidator(col_name, schemaValidor);
                }
            }
            console.log(`Successfully created mongodb indexes & schema validators for collections: ${JSON.stringify(collections)}`);
        } catch (e) {
            console.error('Error while running script to create mongodb indexes', e, {});
        } finally {
            process.exit(1)
        }
    }

    async createIndex(dbCol, dbIndex) {
        try {
            const { key, options } = dbIndex;
            const result = await dbCol.createIndex(key, options);
            console.log(`On collection ${dbCol.collectionName} index created: ${result}`, {});
        } catch (e) {
            console.error('Error while creating index', dbIndex, `on collection :${dbCol.collectionName}`, e, {});
        }
    }

    async applySchemaValidator(col_name, validator) {
        const response = await this.db.command({ collMod: col_name, validator });
        if(response.ok !==1){
            console.error('Error while creating schema validator for collection ' , col_name);
        }
    }
}


if (asMain) {
    const options = parseOptions(process.argv);
    let app;
    initResources(options)
        .then(context => {
            app = new MongoSchema(context);
        })
        .catch(async error => {
            console.error('Failed to initialize', error.stack || error);
            process.exit(1);
        });
}