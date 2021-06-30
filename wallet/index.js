const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction.js');
const Blockchain = require('../blockchain');
const Block = require('../blockchain');
const fs = require('fs');
const crypto = require('crypto');

class Wallet{
    /**
     * the wallet will hold the public key
     * and the private key pair
     * and the balance
     */
constructor()
{
    this.balance = INITIAL_BALANCE;
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', 
    {
        namedCurve: 'secp256k1', // curve name we are using
        publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
        },
        privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        }
    })

  if (fs.existsSync("./keys/public.pem")) {
    this.publicKey = fs.readFileSync('./keys/public.pem', 'utf8', (err, file) => {if (err) throw err;});
  } else {
    fs.writeFile("./keys/public.pem", publicKey, (err , file) =>console.log('Public Key File Not Found...Creating New Public Key'));
    this.publicKey = publicKey;
  }

  //For Private Key
    if (fs.existsSync("./keys/private.pem")) {
    this.privateKey = fs.readFileSync('./keys/private.pem', 'utf8', (err, file) => {if (err) throw err;});
  } else {
    fs.writeFile("./keys/private.pem", privateKey, (err , file) =>console.log('Private Key File Not Found...Creating New Private Key'));
    this.privateKey = privateKey;
  }
  this.address = this.publicKey;

}

toString(){
        return `Wallet - 
        publicKey: ${this.publicKey}
        balance  : ${this.balance}`
    }

    sign(dataHash)
    {
        //return this.privateKey.sign(dataHash);
        const sign = crypto.createSign('SHA256');
        sign.write(dataHash);
        sign.end();
        const signature = sign.sign(fs.readFileSync('./keys/private.pem', 'utf8'), 'hex');
        return signature;

    }

    /**
     * combines the functionality to create a new transaction
     * update a transaction into one and also update the transaction
     * pool if the transaction exists already.
     */

    createTransaction(recipient, amount,Blockchain, transactionPool){

        this.balance = this.calculateBalance(Blockchain);

        if(amount > this.balance){
            console.log(`Amount: ${amount} exceeds the current balance: ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if(transaction){
            // creates more outputs
            transaction.update(this,recipient,amount)
        }
        else{
            // creates a new transaction and updates the transaction pool
            transaction = Transaction.newTransaction(this,recipient,amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;

    }

    /**
     * updates the balance of the wallet
     * based on the latest transaction
     */

    calculateBalance(Blockchain){
        
        // store the existing balance
        // let balance = this.balance;

        // create an array of transactions
        let transactions = [];

        // store all the transactions in the array
        Blockchain.chain.forEach(Block => Block.data.forEach(transaction =>{
            transactions.push(transaction);
        }));

        // get all the transactions generated by the wallet ie money sent by the wallet
        const walletInputTransactions = transactions.filter(transaction => transaction.input.address == this.publicKey);

        // declare a variable to save the timestamp
        let startTime = 0;

        let newbalance = 0;
        console.log(walletInputTransactions);
        if(walletInputTransactions.length > 0){

            // get the latest transaction
            const recentInputTransaction = walletInputTransactions.reduce((prev,current)=> prev.input.timestamp >= current.input.timestamp ? prev : current );
            
            // get the outputs of that transactions, its amount will be the money that we would get back
            newbalance = recentInputTransaction.outputs.find(output => output.address == this.publicKey).amount
            console.log(newbalance);

            // save the timestamp of the latest transaction made by the wallet
            startTime = recentInputTransaction.input.timestamp
        }

        // get the transactions that were addressed to this wallet ie somebody sent some moeny
        // and add its ouputs.
        // since we save the timestamp we would only add the outputs of the transactions recieved
        // only after the latest transactions made by us

        transactions.forEach(transaction =>{
            if(transaction.input.timestamp > startTime){
                transaction.outputs.find(output=>{
                    if(output.address == this.publicKey){
                        newbalance += output.amount;
                    }
                })
            }
        })
        return newbalance;

    }

    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'Blockchain-wallet';
        return blockchainWallet;
    }
}


module.exports = Wallet;