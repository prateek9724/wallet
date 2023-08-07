const mongodb = require('mongodb'),
    { MongoClient } = mongodb;
    const utils = require('./utils');


const addMongoDbOptions = (cmd) => {
    return cmd  
    .option('--mongo-url <mongo-url>', 'MongoDb Url')
    .option('--mongo-user <mongo-user>', 'MongoDb auth.user')
    .option('--mongo-password <mongo-password>', 'MongoDb auth.password')
    .option('--mongo-no-auth <mongo-not-auth>', 'MongoDb noauth flag', false)
    .option('--mongo-poolsize <mongo-poolsize>', 'MongoDb pool size', '5')
    .option('--mongo-connect-timeout-ms <mongo-connect-timeout>', 'MongoDb client connect timeout (default 10000)', utils.parseInteger, 10000)
    .option('--mongo-unified-topology <enabled>', 'MongoDb use unified topology in client driver', utils.formatBool, true)
}


/**
 * Init Mongo Client
 */
const initMongoClient = async (context) => {
    const { options } = context;
    let { mongoUrl, mongoUser, mongoPassword,  mongoNoAuth, mongoPoolSize, mongoConnectTimeoutMs
        , mongoUnifiedTopology } = options;
    const connectOptions = {
        useNewUrlParser: true,
        auth: mongoNoAuth ? null : {
            user: mongoUser,
            password: mongoPassword
        },
        // poolSize : mongoPoolSize ? utils.parseInteger(mongoPoolSize) : 5,
        connectTimeoutMS: mongoConnectTimeoutMs,
        keepAlive: true,
        // auto_reconnect: true,
        ...(mongoUnifiedTopology ? {
            useUnifiedTopology: mongoUnifiedTopology
        } : {})
    }

    if (!mongoUrl) {
        throw new Error('MongoDB url is missing');
    }
    if (!mongoNoAuth && (!mongoUser && !mongoPassword)) {
        throw new Error('MongoDB user & paswword missing');
    }

    console.log(`Connecting to MongoDB client, url : ${mongoUrl}`)
    const mongoClient = await MongoClient.connect(mongoUrl, connectOptions);
    context.db = mongoClient.db();
    context.mongoClient = mongoClient;
    console.log(`Mongodb client connected `);
    return context;
}

module.exports = {
    addMongoDbOptions,
    initMongoClient
}