"# wallet" 

Prerequisites:
1. Nodejs (v14.16.0)

How to Run? 

1. clone the wallet repo.
   
   #Setup For Wallet Backend Service.
2. In root directory of the Project, execute -  npm i

3. Set up the Schema indexes/validators using following command.  
   node services/mongo-schema-service.js --mongo-url=mongodb://localhost:27017/mlevel --mongo-no-auth=true  

   Note: This is important to run before running the services to perform the schema relation operations. 

4. Run the Wallet App using the following command. 
   node services/wallet.js --mongo-url=mongodb://localhost:27017/mlevel --mongo-no-auth=true