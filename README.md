*** Wallet Service ***

Prerequisites:
1. Nodejs (v14.16.0)


/**
*** How to Setup locally? ***
*/
1. Clone the wallet repo & switch to branch - master .
   
2. In root directory of the Project, execute -  npm i

3. Set up the Schema indexes/validators using following command.  
   - node services/mongo-schema-service.js --mongo-url=mongodb://localhost:27017/mlevel --mongo-no-auth=true  

   Note: This is important to run before running the services to perform the schema relation operations. 

4. Setup & build the frontend wallet app.
   - cd frontend/wallet-fe/
   - npm i
   - npm run build

5. Run the Wallet App from the root directory of Project using the following command. 
   - node services/wallet.js --mongo-url=mongodb://localhost:27017/mlevel --mongo-no-auth=true

6. To Access the App go to link 
   - http://localhost:1600/api/v1/wallet/app 


/**
*** API Endpoints: ***
*/
1. Setup the wallet
*** POST: /api/v1/wallet/setup ***
Body: {
    "name" : String[required]
    "balance": String[optional]
}

Ex- 
POST: /api/v1/wallet/setup
Body: {
    "name" : "Wallet D",
    "balance": "9.1199"
}

2. Get the wallet details by wallet id.
*** GET: api/v1/wallet/:walletId ***

Ex-
GET: /api/v1/wallet/64cf6de4e1ff1207a65f8155

3. Perform Credit/Debit transaction via wallet
*** POST: /api/v1/wallet/transact/:walletId ***
Body: {
    "amount" : String[required],  NOTE: amount is converted into decimal & whether no. is less < 0 or not we decide if its DEBIT or CREDIT transaction. 
    "description": String[optional]
}

Ex-
POST: /api/v1/wallet/transact/64cf6de4e1ff1207a65f8155
Body: {
    "amount" : "2.0", // Its a credit transaction
    "description": "Wallet Recharge"
}

Ex-
POST: /api/v1/wallet/transact/64cf6de4e1ff1207a65f8155
Body: {
    "amount" : "-11.043", // Its a Debit transaction
    "description": "Mobile data pack recharge"
}

4. Get the wallet transactions in paginated way.
*** GET: /api/v1/wallet/transactions/?walletId={walletId}skip={skip}&limit={limit} ***

Ex - 
/api/v1/wallet/transactions/?walletId=64cf6de4e1ff1207a65f8155&skip=0&limit=10




/**
*** Schema & query design. ***
*/

1. Wallets Schema: 
{
  "_id": ObjectId,
  "name": String,
  "balance": Decimal, *** Schema Level Validation is applied here to makee sure it never holds a value less than 0. ***
  "date": Date,
  "updatedOn": Date,
  "active": Bool
}

Ex - {
  "_id": "64d14d6a1ee63c1afc4e38cc",
  "name": "Umang Varshney",
  "balance": 7.4014,
  "date": "2023-08-07T20:00:42.944Z",
  "updatedOn": "2023-08-07T20:00:54.212Z",
  "active": true
}

2. Transactions Schema:

{
  "_id": ObjectId,
  "type": String[CREDIT/DEBIT],
  "amount": Decimal, // *** Number to be debited or credited from the wallet. ***
  "walletId": String, // Id of the Wallet
  "description": String,
  "status": String[IN_PROGRESS/FAILED/COMPLETED], // *** Keeps the status of the transaction *** 
  "date": Date,
  "updatedOn": Date, 
  "previousBalance": Decimal, // *** wallet balance just before transaction ***
  "balance": Decimal // *** this is the wallet balance after the transaction ***
}

Ex- {
  "_id": "64d1515930ff379b15fb3382",
  "type": "DEBIT",
  "amount": -7.2966,
  "walletId": "64d1510c30ff379b15fb337b",
  "description": "",
  "status": "COMPLETED",
  "date": "2023-08-07T20:17:29.639Z",
  "updatedOn": "2023-08-07T20:17:29.641Z",
  "previousBalance": 7.2966,
  "balance": 0
}


* Query Design - 

1. Search Query in wallets collection:
   Search query is applied on _id: ObjectId("walletId") 
   which don't need any new Index to be created.

2. Search Query in transactions collection:
   Search query applied on walletId which is a non-indexed field. 
   *** So created an index on walletId in transactions collection. ***


* Schema validator
1. on wallet collection. Wallet balance can never go negative.
  *** Applied a schema validator for balance<Decimal> field in wallets collection so that for any transaction its value can never go negative. ***
  *** Throws error if any transacion takes the wallet balance to less than 0 then it throws an error and no transaction commit happens ***