const { MONGO_SERVER_ERROR, MONGO_DOCUMENT_VALIDATION_FAILURE_CODE } = require("../lib/utils");

const { ExpressApp, initDefaultOptions, initialze, initValidateOptions } = require("../lib/nodev1"),
    { addMongoDbOptions, initMongoClient } = require('../lib/mongodb-utls'),
    { ObjectId, Decimal128 } = require('mongodb'),
    asMain = (require.main === module);

const path = require('path');

const parseOptions = (argv) => {
    let cmd = initDefaultOptions(1600);
    cmd = addMongoDbOptions(cmd);
    return cmd
        .option('--default-route <mount-path>', 'Path to prefix all URLs (other than alive)', '/api/v1')
        .parse(argv)
        .opts();
}

const initResources = async (options) => {
    return await initialze(options)
        .then(initValidateOptions('mongoUrl'))
        .then(initMongoClient)
}

const WALLETS_COLLECTION = 'wallets';
const TRANSACTIONS_COLLECTION = 'transactions';

class WalletService extends ExpressApp {
    constructor(context) {
        super(context)
        this.db = context.db;
        this.mongoClient = context.mongoClient;
    }

    registerRoutes() {
        const router = this.router;
        
        // To server the React App.
        this.app.use(this.express.static(path.resolve(__dirname, '../frontend/wallet-fe/build')));
        router.get('/wallet/app', this.renderApp.bind(this));

        router.post('/wallet/setup', this.createWallet.bind(this));
        router.post('/wallet/transact/:walletId', this.performTransaction.bind(this));
        router.get('/wallet/transactions', this.listTransactionsByWallet.bind(this));
        router.get('/wallet/:walletId', this.getWalletById.bind(this));
    }

    async renderApp(req, res){
       return res.sendFile(path.resolve(__dirname, '../frontend/wallet-fe/build', 'index.html'));
    }

    async createWallet(req, res) {
        const { name, balance } = req.body;
        try {
            const collection = this.db.collection(WALLETS_COLLECTION);
            const auditDate = new Date();
            const initialBalance = "0";
            const payload = {
                name,
                balance: new Decimal128(initialBalance),
                date: auditDate,
                updatedOn: auditDate,
                active: true
            }
            await collection.insertOne(payload);
            // Apply Transaction on Wallet wth the balance received & description "Initial Balance" 
            const { modifiedWallet, onTransaction } = await this.applyTransaction.call(this,
                { ...payload, _id: payload._id.toString() },
                {
                    amount: balance ? new Decimal128(balance) : new Decimal128(initialBalance),
                    description: "Initial Balance"
                });
            return res.status(200).json({
                id: modifiedWallet._id.toString(),
                name: modifiedWallet.name,
                date: modifiedWallet.date,
                balance: modifiedWallet.balance.toString(),
                transactionId: onTransaction._id.toString()
            })
        } catch (e) {
            console.error(`Error in creating wallet by name: ${name} & balance: ${balance}`, e, {});
            if (e.name === MONGO_SERVER_ERROR) {
                return res.status(400).json({
                    message: 'Error while creating wallet',
                    code: 'wallet.create.error'
                })
            }
            return res.status(500).json({
                message: `Error in creating wallet by name: ${name} & balance: ${balance}`,
                code: 'wallet.create.error'
            })
        }
    }

    async getWalletById(req, res) {
        const { walletId } = req.params;
        try {
            const collection = this.db.collection(WALLETS_COLLECTION);
            const response = await collection.findOne({
                _id: new ObjectId(walletId),
                active: true
            })
            if (!response) {
                return res.status(404).json({
                    message: `Could not find Wallet by id: ${walletId}`,
                    code: 'wallet.find.error'
                })
            }
            return res.status(200).json({
                id: response._id.toString(),
                name: response.name,
                balance: response.balance.toString(),
                date: response.date
            });
        } catch (e) {
            console.log(`Error in finding wallet by id: ${walletId}`, e, {});
            return res.status(500).json({ message: `Error in finding wallet by id: ${walletId}`, code: 'wallet.find.by.id.error' })
        }
    }

    async performTransaction(req, res) {
        const { walletId } = req.params;
        const { amount, description } = req.body;
        try {
            const collection = this.db.collection(WALLETS_COLLECTION);
            const response = await collection.findOne({
                _id: new ObjectId(walletId),
                active: true
            })
            if (!response) {
                return res.status(404).json({
                    message: `Could not find Wallet by id: ${walletId}`,
                    code: 'wallet.find.error'
                })
            }
            // Apply Transaction here
            const { modifiedWallet, onTransaction } = await this.applyTransaction.call(this,
                { _id: walletId, balance: response.balance },
                {
                    amount: new Decimal128(amount),
                    description
                });
            return res.status(200).json({ balance: modifiedWallet.balance.toString(), transactionId: onTransaction._id.toString() });
        } catch (e) {
            console.error(`Error while performing transaction on wallet ${walletId}`, e, {});
            if (e.name === MONGO_SERVER_ERROR) {
                if(e.code === MONGO_DOCUMENT_VALIDATION_FAILURE_CODE){
                    return res.status(400).json({
                        message: `Insufficient balance in Wallet ${walletId}`,
                        code: 'wallet.insufficient.balance.error'
                    })
                }
                return res.status(400).json({
                    message: `Couldn't complete the transaction on wallet ${walletId}`,
                    code: 'wallet.transaction.bad.request'
                })
            }
            return res.status(500).json({ message: `Error while performing transaction on wallet ${walletId}`, code: 'wallet.transaction.error' })
        }
    }

    async listTransactionsByWallet(req, res) {
        let { walletId, skip, limit } = req.query;
        skip = Number.parseInt(skip);
        limit = Number.parseInt(limit);
        try {
            const aggregation = [];
            const $match = { $match: { walletId } }
            aggregation.push($match);
            const $sort = { $sort: { _id: -1 } };
            aggregation.push($sort);
            const $skip = { $skip: skip };
            aggregation.push($skip);
            const $limit = { $limit: limit };
            aggregation.push($limit);
            const projection = {
                $project: {
                    _id: 0,
                    id: "$_id",
                    walletId: 1,
                    amount: { $toString: "$amount" },
                    balance: { $toString: "$balance" },
                    description: 1,
                    date: 1,
                    type: 1,
                    status: 1
                }
            }
            aggregation.push(projection);
            const collection = this.db.collection(TRANSACTIONS_COLLECTION);
            const result = await collection.aggregate(aggregation).toArray();
            return res.status(200).json(result);
        } catch (e) {
            console.error(`Error in fetching transactions by wallet id ${walletId}`, e, {});
            res.status(500).json({ message: `Error in fetching transactions by wallet id ${walletId}`, code: 'wallet.transactions.list.error' })
        }
    }

    async applyTransaction(wallet, transactionDetails) {
        const { _id, balance } = wallet;
        const { amount, description } = transactionDetails;
        let transationResult;
        const walletCol = this.db.collection(WALLETS_COLLECTION);
        const transactionCol = this.db.collection(TRANSACTIONS_COLLECTION);
        try {
            // 1. Create a record in Transaction col, with status 'IN_PROGRESS'
            const auditDate = new Date();
            const transactionPayload = {
                type: amount > 0 ? 'CREDIT' : 'DEBIT',
                amount,
                walletId: _id,
                description,
                status: 'IN_PROGRESS',
                date: auditDate,
                updatedOn: auditDate,
                previousBalance: balance,
                balance
            }
            transationResult = await transactionCol.insertOne(transactionPayload);
        } catch (e) {
            console.error(`Error while creating a transaction record for wallet ${_id}` , e, {})
            throw e;
        }

        // Following is a Transaction to commit the wallet balance changes & status of Transaction to COMPLETED with update balance.
        const session = this.mongoClient.startSession();
        try {
            session.startTransaction();
            //  2. Apply the transaction amount on balance in wallet col 
            const walletResult = await walletCol.findOneAndUpdate(
                { _id: new ObjectId(_id), active: true },
                { $inc: { balance: amount }, $set: { updatedOn: new Date() } },
                { returnDocument: "after" }
            )
            if (!walletResult.value || walletResult.ok !== 1) {
                // throw error here that the transaction could not be completed. & update the transaction as FAILED
                const message = `Failed to Modify Wallet ${_id} for transaction ${transationResult.insertedId.toString()} for ${amount}, ${description}}`
                console.error(message);
                throw { message, result: walletResult };
            }

            // 3. On success, update the transaction col status 'COMPLETED' & wallets updated balance from Step 2.
            const transactionUpdate = await transactionCol.findOneAndUpdate(
                { _id: transationResult.insertedId },
                { $set: { balance: walletResult.value.balance, status: 'COMPLETED', updatedOn: new Date() } },
                { returnDocument: "after" }
            )

            if (!transactionUpdate.value || transactionUpdate.ok !== 1) {
                // throw error about the transaction object
                const message = `Faied to Modify Transaction ${transationResult.insertedId.toString()} Status to COMPLETED for Wallet ${_id} for ${amount}, ${description}`;
                console.error(message);
                throw { message, result: transactionUpdate };
            }

            session.commitTransaction();
            return { modifiedWallet: walletResult.value, onTransaction: transactionUpdate.value };
        } catch (e) {
            if (transationResult) {
                await transactionCol.findOneAndUpdate(
                    { _id: transationResult.insertedId },
                    { $set: { status: 'FAILED', updatedOn: new Date(), failedReason: e } },
                    { returnDocument: "after" }
                )
            }
            session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

}

if (asMain) {
    const options = parseOptions(process.argv);
    let app;
    initResources(options)
        .then(context => {
            app = new WalletService(context).run();
        })
        .catch(async error => {
            console.error('Failed to initialize', error.stack || error);
            process.exit(1);
        });
}
